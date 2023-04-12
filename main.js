const map = L.map("map", {
  center: [-38.9412346, -68.1154008],
  zoom: 6,
});
let modoQuitarCapas = false;
const capaBaseActiva = "argenmapBase";
const capasActivas = [];
const listaMapasBase = document.getElementById("mapasBase");
const quitarCapasBtn = document.getElementById("quitarCapas");
const comenzarBtn = document.getElementById("btnComenzar");
const infoToast = document.getElementById("infoToast");
const panelDeBienvenida = document.getElementById("panelDeBienvenida");
const panelCapasActivasElement = document.getElementById("panelCapasActivas");
const panelCapasActivasBtn = document.getElementById("panelCapasActivasBtn");
const listaCapasActivas = document.getElementById("listaCapasActivas");
const inputOpacidad = document.getElementById("opacidad");
const spinner = document.getElementById("spinner");
const baseArgenmapBtn = document.getElementById("argenmapBase");
const baseArgenmapGrisBtn = document.getElementById("argenmapGris");
const baseArgenmapOscuroBtn = document.getElementById("argenmapOscuro");
const baseArgenmapTopograficoBtn = document.getElementById(
  "argenmapTopografico"
);
const parser = new XMLParser();
let capas = [];
let capaSeleccionada = "";
let capasTotalmenteCargadas = 0;
let opacidad = 0;
let capasDePruebaActivas = [];
const capasBase = {
  argenmapBase: L.tileLayer(
    "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png",
    {
      attribution:
        "<a href='https://www.ign.gob.ar/AreaServicios/Argenmap/Introduccion'>Instituto Geográfico Nacional</a> | <a href='https://www.copade.gob.ar/'>COPADE &#169;</a>",
    }
  ),
  argenmapGris: L.tileLayer(
    "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_gris@EPSG%3A3857@png/{z}/{x}/{-y}.png",
    {
      attribution:
        "<a href='https://www.ign.gob.ar/AreaServicios/Argenmap/Introduccion'>Instituto Geográfico Nacional</a>",
    }
  ),
  argenmapTopografico: L.tileLayer(
    "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_topo@EPSG%3A3857@png/{z}/{x}/{-y}.png",
    {
      attribution:
        "<a href='https://www.ign.gob.ar/AreaServicios/Argenmap/Introduccion'>Instituto Geográfico Nacional</a>",
    }
  ),
  argenmapOscuro: L.tileLayer(
    "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/argenmap_oscuro@EPSG%3A3857@png/{z}/{x}/{-y}.png",
    {
      attribution:
        "<a href='https://www.ign.gob.ar/AreaServicios/Argenmap/Introduccion'>Instituto Geográfico Nacional</a>",
    }
  ),
};

quitarCapasBtn.addEventListener("click", () => {
  modoQuitarCapas = !modoQuitarCapas;
  if (modoQuitarCapas) {
    quitarCapasBtn.classList =
      "text-white bg-red-900 border-red-900 btn btn-xs btn-wide";
    quitarCapasBtn.innerText = "Clickea para eliminar capas.";
    mostrarMensaje(`Haz click en las capas que quieras quitar.`);
  } else {
    quitarCapasBtn.classList =
      "text-white bg-red-600 border-red-600 btn btn-xs btn-wide hover:bg-red-700 hover:border-red-700";
    quitarCapasBtn.innerText = "Quitar Capas";
  }
});

comenzarBtn.addEventListener("click", () => {
  panelDeBienvenida.classList.add("hidden");
  panelCapasActivasElement.classList.remove("hidden");
  mostrarMensaje(
    `¡Bienvenido! Haz click en la flecha para abrir el menu derecho y selecionar capas.`
  );
});

inputOpacidad.addEventListener("change", () => {
  opacidad = inputOpacidad.value * 0.01;
  selectorDeOpacidad();
});

const mostrarMensaje = (mensaje) => {
  infoToast.classList.remove("hidden");
  infoToast.classList.add("absolute");

  infoToast.innerHTML = `<div class="alert alert-info">
  <div>
    <span>${mensaje}</span>
  </div>
</div>`;

  setTimeout(() => {
    infoToast.classList.add("hidden");
    infoToast.classList.remove("absolute");
  }, 2500);
};

const traerCapas = async () => {
  const listaDePrueba = document.getElementById("capasDePrueba");
  const response = await fetch(
    "https://megacors.onrender.com/giscopade.neuquen.gov.ar/geoserver/wms?request=getCapabilities",
    {
      headers: {
        "Content-Type": "text/xml",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
  const xmlString = await response.text();
  const json = parser.parse(xmlString);

  capas = json.WMS_Capabilities.Capability.Layer.Layer;
  console.log(capas);
  capas.forEach((element, i) => {
    if (i < 10) {
      const nuevoLi = document.createElement("li");
      nuevoLi.classList = "badge badge-ghost cursor-pointer select-none";
      nuevoLi.id = element.Name;
      nuevoLi.innerText = element.Title.toUpperCase();
      listaDePrueba.appendChild(nuevoLi);

      nuevoLi.addEventListener("click", () => {
        toggleCapa(element.Name, nuevoLi);
      });

      var nuevaCapa = L.tileLayer.wms(
        "https://megacors.onrender.com/http://giscopade.neuquen.gov.ar/geoserver/wms",
        {
          layers: [element.Name],
          format: "image/png",
          transparent: true,
        }
      );
      setLoadEvent(nuevaCapa);

      capasDePruebaActivas.push(nuevaCapa);
    }
  });
  console.log(capasDePruebaActivas);
  capasDePruebaActivas[3].setOpacity(0.2);
};

const setLoadEvent = (layer) => {
  layer.on("load", () => {
    setTimeout(() => {
      if (spinner.classList.contains("flex")) {
        spinner.classList.remove("flex");
        spinner.classList.add("hidden");
      }
    }, 2500);
  });
};

const cargarCapasActivas = () => {
  listaCapasActivas.innerHTML = "";
  let activas = [];
  activas = document.querySelectorAll(".activo");

  Array.from(activas).map((e) => {
    const nuevoLi = document.createElement("li");

    nuevoLi.classList = e.classList;
    nuevoLi.classList.remove("activo");
    nuevoLi.id = e.id + "2";
    nuevoLi.innerText = e.innerText;
    listaCapasActivas.appendChild(nuevoLi);
    nuevoLi.addEventListener("click", () => {
      if (modoQuitarCapas) {
        toggleCapa(e.id, e);
        return;
      } else {
        mostrarDetalleCapaSelecionada(e.id);
      }
    });
  });
};
const selectorDeOpacidad = () => {
  if (capaSeleccionada === "") {
    alert("Primero seleccione una capa para cambiar su opacidad");
    return;
  }

  map.eachLayer((layer) => {
    if (layer.options.hasOwnProperty("layers")) {
      console.log(layer.options.layers[0]);
      if (layer.options.layers[0] === capaSeleccionada.Name) {
        layer.setOpacity(opacidad.toFixed(1));
        return;
      }
    }
  });
};

const toggleSpiner = () => {
  if (spinner.classList.contains("hidden")) {
    spinner.classList.remove("hidden");
    spinner.classList.add("flex");
  } else {
    spinner.classList.remove("flex");
    spinner.classList.add("hidden");
  }
};

const selectorDeCapasBase = (capa) => {
  map.eachLayer((layer) => {
    if (!layer.options.layers) {
      map.removeLayer(layer);
      toggleSpiner();
      let indicator = document.createElement("span");
      Array.from(document.getElementsByClassName("mapasBase")).map((e) => {
        if (e.id === capa) {
          e.classList.remove("border-primary");
          e.classList.add("border-accent");
          indicator.classList = "indicator-item badge badge-accent";
          indicator.innerText = "Activa";
          e.appendChild(indicator);
        } else {
          e.classList.remove("border-accent");
          e.classList.add("border-primary");
          Array.from(e.childNodes).map((element) => {
            if (element.tagName === "SPAN") {
              e.removeChild(element);
            }
          });
        }
      });

      switch (capa) {
        case "argenmapBase":
          map.addLayer(capasBase.argenmapBase);
          toggleSpiner();
          break;
        case "argenmapGris":
          map.addLayer(capasBase.argenmapGris);
          toggleSpiner();

          break;
        case "argenmapTopografico":
          map.addLayer(capasBase.argenmapTopografico);
          toggleSpiner();

          break;
        case "argenmapOscuro":
          map.addLayer(capasBase.argenmapOscuro);
          toggleSpiner();

          break;
      }
    }
  });
};

baseArgenmapBtn.addEventListener("click", () => {
  selectorDeCapasBase("argenmapBase");
});
baseArgenmapGrisBtn.addEventListener("click", () => {
  selectorDeCapasBase("argenmapGris");
});
baseArgenmapTopograficoBtn.addEventListener("click", () => {
  selectorDeCapasBase("argenmapTopografico");
});
baseArgenmapOscuroBtn.addEventListener("click", () => {
  selectorDeCapasBase("argenmapOscuro");
});

const moverseAlaNuevaCapa = (capa) => {
  capas.map((e) => {
    if (e.Name === capa) {
      console.log(e.EX_GeographicBoundingBox);

      map.flyToBounds([
        [
          e.EX_GeographicBoundingBox.northBoundLatitude,
          e.EX_GeographicBoundingBox.eastBoundLongitude,
        ],
        [
          e.EX_GeographicBoundingBox.southBoundLatitude,
          e.EX_GeographicBoundingBox.westBoundLongitude,
        ],
      ]);
    }
  });
};

const mostrarDetalleCapaSelecionada = (capa) => {
  capas.map((e) => {
    if (e.Name === capa) {
      capaSeleccionada = e;
    }
  });
  const titulo = document.getElementById("tituloCapaSeleccionada");
  const detalle = document.getElementById("detalleCapaSeleccionada");
  const listaCapas = document.getElementById("listaCapasActivas").children;
  const seleccionado = document.getElementById(`${capa}2`);
  const tituloOpacidad = document.getElementById("tituloOpacidad");

  Array.from(listaCapas).map((e) => {
    if (e.id === seleccionado.id) {
      e.classList =
        "badge badge-primary cursor-pointer select-none activo ring-4 ring-yellow-300";
    } else {
      e.classList = "badge badge-primary cursor-pointer select-none";
    }
  });

  titulo.innerText = capaSeleccionada.Title.toUpperCase();
  tituloOpacidad.innerText = capaSeleccionada.Title.toUpperCase();

  if (capaSeleccionada.Abstract === "") {
    detalle.innerText = "No hay descripción disponible.";
  } else {
    detalle.innerText = capaSeleccionada.Abstract;
  }
};

const toggleCapa = async (capa, element) => {
  capasDePruebaActivas.map((e) => {
    if (e.options.layers[0] === capa) {
      if (map.hasLayer(e)) {
        map.removeLayer(e);
        capasActivas.splice(capasActivas.indexOf(capa), 1);
        element.classList = "badge badge-ghost cursor-pointer select-none";
        cargarCapasActivas();
      } else {
        toggleSpiner();
        map.addLayer(e);
        moverseAlaNuevaCapa(capa);
        capasActivas.push(e.options.layers[0]);
        element.classList =
          "badge badge-primary cursor-pointer select-none activo";
        cargarCapasActivas();

        if (!panelCapasActivasElement.classList.contains("opened")) {
          panelCapasActivasBtn.click();
        }
      }
    }
  });
};

const panelRight = L.control
  .sidepanel("mipanel", {
    panelPosition: "left",
    hasTabs: true,
    tabsPosition: "top",
    pushControls: true,
    darkMode: true,
    startTab: "tab-1",
  })
  .addTo(map);

const panelCapasActivas = L.control
  .sidepanel("panelCapasActivas", {
    panelPosition: "right",
    hasTabs: true,
    tabsPosition: "top",
    pushControls: true,
    darkMode: true,
    startTab: "tab-1",
  })
  .addTo(map);

// CAPA BASE INICIAL

capasBase.argenmapBase.addTo(map);

// TRAER LAS CAPAS DEL SERVIDOR

traerCapas();

L.easyPrint({
  title: "Imprimir mapa",
  position: "topright",
  sizeModes: ["Current", "A4Landscape", "A4Portrait"],
  filename: "mapa",
}).addTo(map);

const cambiarNombreDeBotonesPrint = () => {
  const botones = document.querySelectorAll(".easyPrintSizeMode");
  Array.from(botones).map((e) => {
    if (e.title === "Current Size") {
      e.title = "Tamaño actual";
    }
    if (e.title === "A4 Landscape") {
      e.title = "A4 Horizontal";
    }
    if (e.title === "A4 Portrait") {
      e.title = "A4 Vertical";
    }
  });
};

cambiarNombreDeBotonesPrint();

const selectorDescargaCapa = document.getElementById("descargarCapa");
selectorDescargaCapa.addEventListener("change", (e) => {
  downloadFile(e.target);
});

const downloadFile = (format) => {
  if (format.value === "descargar") {
    return;
  }

  switch (format.value) {
    case "shapefile":
      window.location =
        "https://giscopade.neuquen.gov.ar/geoserver/Copade/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
        capaSeleccionada.Name +
        "&outputformat=SHAPE-ZIP&SRSNAME=EPSG:4326";
      break;

    case "json":
      window.open(
        "https://giscopade.neuquen.gov.ar/geoserver/Copade/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
          capaSeleccionada.Name +
          "&outputformat=JSON&SRSNAME=EPSG:4326"
      );

      break;

    case "csv":
      window.location =
        "https://giscopade.neuquen.gov.ar/geoserver/Copade/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
        capaSeleccionada.Name +
        "&outputFormat=csv";
      break;
    case "jsonp":
      window.open(
        "https://giscopade.neuquen.gov.ar/geoserver/Copade/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
          capaSeleccionada.Name +
          "&outputFormat=application/json"
      );
      break;
    case "kml":
      window.location =
        "https://giscopade.neuquen.gov.ar/geoserver/Copade/wms/kml?layers=" +
        capaSeleccionada.Name;
      break;

    case "gml2":
      window.open(
        "https://giscopade.neuquen.gov.ar/geoserver/Copade/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
          capaSeleccionada.Name +
          "&info_format=application/vnd.ogc.gml"
      );
      break;
    case "gml3":
      window.open(
        "https://giscopade.neuquen.gov.ar/geoserver/Copade/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
          capaSeleccionada.Name +
          "&outputFormat=application/vnd.ogc.gml/3.1.1"
      );
      break;

    default:
      break;
  }
};
