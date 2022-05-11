const initCanvas = (id) => {
  return new fabric.Canvas(id, {
    width: 500,
    height: 500,
    selection: false,
  });
};

const setBackground = (url, canvas) => {
  fabric.Image.fromURL(url, (img) => {
    canvas.backgroundImage = img;
    canvas.renderAll();
  });
};

const toggleMode = (mode) => {
  if (mode === modes.pan) {
    if (currentMode === modes.pan) {
      currentMode = "";
    } else {
      currentMode = modes.pan;
      canvas.isDrawingMode = false;
      canvas.renderAll();
    }
  } else if (mode === modes.drawing) {
    if (currentMode === modes.drawing) {
      currentMode = "";
      canvas.isDrawingMode = false;
      canvas.renderAll();
    } else {
      currentMode = modes.drawing;
      canvas.freeDrawingBrush.color = color;
      canvas.isDrawingMode = true;
      canvas.renderAll();
    }
  }
};

const setPanEvents = (canvas) => {
  //mouse over
  canvas.on("mouse:move", (event) => {
    if (mousePressed && currentMode === modes.pan) {
      canvas.setCursor("grab");
      canvas.renderAll();
      const mEvent = event.e;
      const delta = new fabric.Point(mEvent.movementX, mEvent.movementY);
      canvas.relativePan(delta);
    }
  });

  canvas.on("mouse:down", (event) => {
    mousePressed = true;
    if (currentMode === modes.pan) {
      canvas.setCursor("grab");
      canvas.renderAll();
    }
  });

  canvas.on("mouse:up", (event) => {
    mousePressed = false;
    canvas.setCursor("default");
    canvas.renderAll();
  });
};

const setColorListener = () => {
  const picker = document.getElementById("colorPicker");
  picker.addEventListener("change", (event) => {
    color = event.target.value;
    canvas.freeDrawingBrush.color = color;
    canvas.renderAll();
  });
};

const clearCanvas = (canvas) => {
  canvas.getObjects().forEach((o) => {
    if (o !== canvas.backgroundImage) {
      canvas.remove(o);
    }
  });
};

const restoreCanvas = (canvas, state, bgUrl) => {
  if (state.val) {
    fabric.loadSVGFromString(state.val, (objects) => {
      objects = objects.filter((o) => o["xlink:href"] !== bgUrl);
      canvas.add(...objects);
      canvas.requestRenderAll();
    });
  }
};

const createRect = (canvas) => {
  const canvasCenter = canvas.getCenter();
  const rect = new fabric.Rect({
    width: 100,
    height: 100,
    left: canvasCenter.left,
    top: -50,
    fill: "purple",
    originX: "center",
    originY: "center",
    cornerColor: "white",
    objectCaching: false,
  });
  canvas.add(rect);
  canvas.renderAll();
  rect.animate("top", canvasCenter.top, {
    onChange: canvas.renderAll.bind(canvas),
  });
  rect.on("selected", () => {
    rect.set("fill", "white");
    canvas.renderAll();
  });
  rect.on("deselected", () => {
    rect.set("fill", "red");
    canvas.renderAll();
  });
};

const createCircle = (canvas) => {
  const canvasCenter = canvas.getCenter();
  const circle = new fabric.Circle({
    radius: 50,
    fill: "yellow",
    left: canvasCenter.left,
    top: -50,
    originX: "center",
    originY: "center",
    cornerColor: "white",
    objectCaching: false,
  });
  canvas.add(circle);
  canvas.renderAll();
  circle.animate("top", canvas.height - 50, {
    onChange: canvas.renderAll.bind(canvas),
    onComplete: () => {
      circle.animate("top", canvasCenter.top, {
        onChange: canvas.renderAll.bind(canvas),
        easing: fabric.util.ease.easeOutBounce,
        duration: 150,
      });
    },
  });
  circle.on("selected", () => {
    circle.set("fill", "white");
    canvas.renderAll();
  });
  circle.on("deselected", () => {
    circle.set("fill", "red");
    canvas.renderAll();
  });
};

const groupObjects = (canvas, group, shouldGroup) => {
  if (shouldGroup) {
    const objects = canvas.getObjects();
    group.val = new fabric.Group(objects, { cornerColor: "white" });
    clearCanvas(canvas, svgState);
    canvas.add(group.val);
    canvas.requestRenderAll();
    console.log("groupé");
  } else {
    group.val.destroy();
    let oldGroup = group.val.getObjects();
    clearCanvas(canvas, svgState);
    canvas.add(...oldGroup);
    group.val = null;
    canvas.requestRenderAll();
    console.log("dégroupé");
  }
};

const imgAdded = (e) => {
  console.log(e);
  const inputElem = document.getElementById("myImg");
  const file = inputElem.files[0];
  reader.readAsDataURL(file);
};

const canvas = initCanvas("canvas");
const svgState = {};
let mousePressed = false;
let color = "#000000";
const group = {};
const bgUrl =
  "https://i.pinimg.com/originals/8d/21/02/8d21029edf1e80eaef5da189529b7b95.jpg";

let currentMode;
const modes = {
  pan: "pan",
  drawing: "drawing",
};

const reader = new FileReader();

setBackground(bgUrl, canvas);
setPanEvents(canvas);
setColorListener();

const inputFile = document.getElementById("myImg");
inputFile.addEventListener("change", imgAdded);

reader.addEventListener("load", () => {
  fabric.Image.fromURL(reader.result, (img) => {
    canvas.add(img);
    canvas.requestRenderAll();
  });
});
