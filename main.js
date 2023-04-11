const map = L.map("map", {
  center: [-38.9412346, -68.1154008],
  zoom: 6,
});
const capasActivas = [];
const panelCapasActivasElement = document.getElementById("panelCapasActivas");
const panelCapasActivasBtn = document.getElementById("panelCapasActivasBtn");
const listaCapasActivas = document.getElementById("listaCapasActivas");
const parser = new XMLParser();
let capas = [];
let capaSeleccionada = "";

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
    }
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
      mostrarDetalleCapaSelecionada(e.id);
    });
  });
};
const selectorDeOpacidad = () => {
  map.eachLayer((layer) => {
    console.log(layer);
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

  Array.from(listaCapas).map((e) => {
    console.log(e.id, seleccionado.id);
    if (e.id === seleccionado.id) {
      e.classList =
        "badge badge-primary cursor-pointer select-none activo ring-4 ring-yellow-300";
    } else {
      e.classList = "badge badge-primary cursor-pointer select-none";
    }
  });

  titulo.innerText = capaSeleccionada.Title.toUpperCase();

  if (capaSeleccionada.Abstract === "") {
    detalle.innerText = "No hay descripción disponible.";
  } else {
    detalle.innerText = capaSeleccionada.Abstract;
  }
};

const toggleCapa = async (capa, element) => {
  selectorDeOpacidad();
  const nuevaLayer = await source.getLayer(capa);

  if (capasActivas.filter((e) => e._name === capa).length > 0) {
    capasActivas.map((e) => {
      if (e._name === capa) {
        source.removeSubLayer(capa);
        capasActivas.splice(capasActivas.indexOf(capa), 1);
        element.classList = "badge badge-ghost cursor-pointer select-none";
        cargarCapasActivas();
        console.log("capas activas", capasActivas);
      }
    });
  } else {
    capasActivas.push(nuevaLayer);
    element.classList = "badge badge-primary cursor-pointer select-none activo";
    cargarCapasActivas();
    nuevaLayer.addTo(grupo);

    if (!panelCapasActivasElement.classList.contains("opened")) {
      panelCapasActivasBtn.click();
    }
  }
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

const source = L.WMS.source(
  "https://megacors.onrender.com/http://giscopade.neuquen.gov.ar/geoserver/wms",
  {
    transparent: true,
    format: "image/png",
  }
);
console.log("source", source);

L.tileLayer(
  "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png",
  {
    maxZoom: 18,
  }
).addTo(map);

const grupo = L.featureGroup();

grupo.addTo(map);

traerCapas();
