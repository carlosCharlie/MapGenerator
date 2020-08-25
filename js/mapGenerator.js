const BOX_SIZE = 1;

const MATRIX_SIZE = 60;
const INIT_MATRIX_SIZE = Math.trunc(MATRIX_SIZE/6);

const MAX_HEIGHT=5;

//box colors
let tmp = Array(6); 
tmp.fill(0);
const COLORS = {
    water:tmp.map(x=> new BABYLON.Color4(2/255,227/255,219/255,0.9)),
    grass:tmp.map(x=> new BABYLON.Color4(30/255,160/255,30/255,0.9))
}
delete(tmp);


class MapGenerator{

    constructor(){

        //water box
        let water = BABYLON.MeshBuilder.CreateBox("water", {faceColors:COLORS.water ,height: BOX_SIZE,width: 1.5*BOX_SIZE*MATRIX_SIZE, depth:1.5*BOX_SIZE*MATRIX_SIZE}, scene);
        water.position.x = Math.trunc((MATRIX_SIZE*BOX_SIZE)/2);
        water.position.z = Math.trunc((MATRIX_SIZE*BOX_SIZE)/1.7);
        water.position.y = BOX_SIZE+0.5;

    }

    optimizeMesh(mesh){
        mesh.freezeWorldMatrix();
        mesh.doNotSyncBoundingInfo = true;
    }

    setScene(scene){
        this.scene = scene;
    }

    //find the 4 closest filled cells in the matrix to the given coords
    find4Closest(i,j){

        let result = {leftUp:{i:i,j:j-1},rightUp:{i:i,j:j+1},leftDown:{i:i-1,j:j},rightDown:{i:i+1,j:j}};
   
        while(result.leftUp.i>0&&this.matrix[result.leftUp.i][result.leftUp.j]==null){
            result.leftUp.j = j-1;
            result.leftUp.i--;
            while(result.leftUp.j>0&&this.matrix[result.leftUp.i][result.leftUp.j]==null)
                result.leftUp.j--;
        }

        while(result.rightUp.i>0&&this.matrix[result.rightUp.i][result.rightUp.j]==null){
            result.rightUp.j = j+1;
            result.rightUp.i--;
            while(result.rightUp.j<this.matrix.length&&this.matrix[result.rightUp.i][result.rightUp.j]==null)
                result.rightUp.j++;
        }

        while(result.leftDown.i<this.matrix.length&&this.matrix[result.leftDown.i][result.leftDown.j]==null){
            result.leftDown.j = j-1;
            result.leftDown.i++;
            while(result.leftDown.j>0&&this.matrix[result.leftDown.i][result.leftDown.j]==null)
                result.leftDown.j--;
        }

        while(result.rightDown.i<this.matrix.length&&this.matrix[result.rightDown.i][result.rightDown.j]==null){
            result.rightDown.j = j+1;
            result.rightDown.i++;
            while(result.rightDown.j<this.matrix.length&&this.matrix[result.rightDown.i][result.rightDown.j]==null)
                result.rightDown.j++;
        }

        return result;
    }

    /*
    Generate a new matrix: matrix[i][j] = altitude at i,j coords in the world
    creates a Perlin noise map and adds cells between the map points making it bigger and softer
    */
    generateMatrix(seed){
        
        noise.seed(seed);
        let jumps = (MATRIX_SIZE/INIT_MATRIX_SIZE)-1;

        this.matrix = [];

        for (let i=0; i<INIT_MATRIX_SIZE; i++){
            let row = [];
            
            for(let j=0; j<INIT_MATRIX_SIZE; j++){

                //Adding Perlin noise cells
                row.push(Math.trunc(6*(1+noise.simplex2(i,j))));

                //Adding empty cells between Perlin noise
                for(let jp=0; jp<jumps; jp++) row.push(null)
            }
            this.matrix.push(row);

            //Adding empty cells between Perlin noise
            for(let jp=0; jp<jumps; jp++) this.matrix.push(row.map(x=>null))
        }

        //Filling empty cells with the mean of the 4 nearlest filled points to make flat floors
        for (let i=1; i<MATRIX_SIZE-(jumps*2); i++){
            for(let j=1; j<MATRIX_SIZE-(jumps*2); j++){
                if(this.matrix[i][j]==null){
                    let closest = this.find4Closest(i,j);
                    this.matrix[i][j] =
                        Math.trunc((this.matrix[closest.leftDown.i][closest.leftDown.j] +
                        this.matrix[closest.leftUp.i][closest.leftUp.j] +
                        this.matrix[closest.rightDown.i][closest.rightDown.j] +
                        this.matrix[closest.rightUp.i][closest.rightUp.j])
                        /4);
                }
            }

        }

        //Removing tall meaningless columns
        for (let i=0; i<MATRIX_SIZE; i++){
            for(let j=0; j<MATRIX_SIZE; j++){
                this.matrix[i][j]--;
                if(i==MATRIX_SIZE-1 || j==MATRIX_SIZE-1 || i==0 || j==0) this.matrix[i][j] = 0;
                else 
                    while(
                        this.matrix[i-1][j]<this.matrix[i][j]-1 &&
                        this.matrix[i+1][j]<this.matrix[i][j]-1 &&
                        this.matrix[i][j-1]<this.matrix[i][j]-1 &&
                        this.matrix[i-1][j+1]<this.matrix[i][j]-1
                        ) this.matrix[i][j]--;
            }
        }

    }


    //Create map in the world from the matrix data
    generateMap(scene){

        for(let i=0; i<MATRIX_SIZE; i++)
            for(let j=0; j<MATRIX_SIZE; j++){

                if(this.matrix[i][j]>=BOX_SIZE){
                    let cube = BABYLON.MeshBuilder.CreateBox("b"+i+"_"+j+"_"+this.matrix[i][j], {faceColors:COLORS.grass ,height: BOX_SIZE,width: BOX_SIZE}, scene);
                    cube.position.x = i*BOX_SIZE;
                    cube.position.z = j*BOX_SIZE,
                    cube.position.y = this.matrix[i][j]
                    this.optimizeMesh(cube);
                

                    //filling to avoid floating cubes
                    let limit = 1;
                    if(i>1&&i<MATRIX_SIZE-1&&j>1&&j<MATRIX_SIZE-1)
                        limit = Math.min(this.matrix[i-1][j],this.matrix[i+1][j],this.matrix[i][j-1],this.matrix[i][j+1]);
                    
                        for(let z = this.matrix[i][j]; z>limit; z--){
                            let cubeDown = BABYLON.MeshBuilder.CreateBox("box"+i+"_"+j+"_"+z, {faceColors:COLORS.grass ,height: BOX_SIZE,width: BOX_SIZE}, scene);
                            cubeDown.position.x = cube.position.x;
                            cubeDown.position.z = cube.position.z;
                            cubeDown.position.y = z*BOX_SIZE;
                            this.optimizeMesh(cubeDown);
                        }
                    
                }
            }
    }

    removeMatrix(){
        delete(this.matrix);
        this.matrix = [];
    }

}