
let canvas = document.getElementById('renderCanvas');
let engine = new BABYLON.Engine(canvas, true);
let seed = Math.random();

function createGUI(){
    
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");   
    
    //layout
    let panel = new BABYLON.GUI.StackPanel();
    advancedTexture.addControl(panel);
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    panel.isVertical = false;
    panel.height = "60px";
    panel.paddingBottom = "20px";
    panel.paddingRight = "20px";
    panel.width = "300px";

    //label
    text1 = new BABYLON.GUI.TextBlock();
    text1.width = "80px";
    text1.height = "40px";
    text1.text = "Seed:";
    text1.color = "white";
    text1.fontSize = 24;
    panel.addControl(text1);

    //text input
    let input = new BABYLON.GUI.InputText();
    input.width = "80px";
    input.height = "40px";
    input.text = seed;
    input.color = "white";
    input.background = "transparent";
    panel.addControl(input);

    //button
    let button = BABYLON.GUI.Button.CreateSimpleButton("but", "Create");
    button.width = "80px";
    button.height = "40px";
    button.background = "green";
    button.onPointerDownObservable.add(function() {
        
        seed = parseFloat(input.text);
        
        for(let i=3; i<scene.rootNodes; i++){
            scene.meshes[i].dispose();
            scene.rootNodes[i].dispose();
        }
        //let it breathe
        setTimeout(()=>{
            scene.meshes = scene.meshes.slice(0,1);
            scene.rootNodes = scene.rootNodes.slice(0,3);
            scene.render();
            mg = new MapGenerator();
            mg.generateMatrix(seed);
            mg.generateMap(scene);
            mg.removeMatrix();
            console.log("done");
        },2000)
    });
    panel.addControl(button);
}
function createScene() {

    //scene
    let scene = new BABYLON.Scene(engine);
    scene.clearColor = COLORS.water[0];
    //optimicing scene
    scene.blockMaterialDirtyMechanism = true;
    scene.blockfreeActiveMeshesAndRenderingGroups = true;
    
    //camera
    let camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 5,-10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);
    camera.position.x = Math.round((BOX_SIZE*MATRIX_SIZE)/2);
    camera.position.z = -BOX_SIZE*MATRIX_SIZE+20;
    camera.position.y = 40;
    
    //light
    let light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

    return scene;
}


scene = createScene();
engine.runRenderLoop(function() {
    scene.render();
});

window.addEventListener('resize', function() {
    engine.resize();
});

let mg = new MapGenerator();
createGUI();