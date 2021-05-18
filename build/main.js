var GJKTutorial;
(function (GJKTutorial) {
    class Framework {
        constructor(inCanvas) {
            this.convexObjs = [];
            this.convexCounter = 0;
            this.convexFillColors = ['#8e232244', '#2387ff44'];
            this.customDrawsBeforeDrawConvex = [];
            this.customDrawsAfterDrawConvex = [];
            this.canvas = inCanvas;
            this.context = this.canvas.getContext("2d");
            this.coord = new GJKTutorial.Coordinate(this.canvas);
            let lastUpdateTime = Date.now();
            setInterval(() => {
                let currentTime = Date.now();
                this.update(currentTime - lastUpdateTime);
                lastUpdateTime = currentTime;
            }, 16);
        }
        update(deltaMs) {
            this.ClearCanvas();
            this.DrawCoordinate(deltaMs);
            this.customDrawsBeforeDrawConvex.forEach(element => {
                element(deltaMs, this.coord, this.context);
            });
            this.DrawConvexObjs(deltaMs);
            this.customDrawsAfterDrawConvex.forEach(element => {
                element(deltaMs, this.coord, this.context);
            });
            if (this.convexObjs.length == 2) {
                if (GJKTutorial.GJKTest(this.convexObjs[0], this.convexObjs[1]) != null) {
                    this.context.fillRect(0, 0, 20, 20);
                }
            }
        }
        AddCustomDrawFunctionBeforeDrawConvex(func) {
            this.customDrawsBeforeDrawConvex.push(func);
        }
        RmvCustomDrawFunctionBeforeDrawConvex(func) {
            let index = this.customDrawsBeforeDrawConvex.indexOf(func);
            if (index >= 0) {
                this.customDrawsBeforeDrawConvex.splice(index, 1);
            }
        }
        AddCustomDrawFunctionAfterDrawConvex(func) {
            this.customDrawsAfterDrawConvex.push(func);
        }
        RmvCustomDrawFunctionAfterDrawConvex(func) {
            let index = this.customDrawsAfterDrawConvex.indexOf(func);
            if (index >= 0) {
                this.customDrawsAfterDrawConvex.splice(index, 1);
            }
        }
        GetCoordinate() {
            return this.coord;
        }
        ClearCanvas() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        DrawCoordinate(deltaMs) {
            this.coord.Draw(deltaMs, this.context);
        }
        DrawConvexObjs(deltaMs) {
            for (let i = 0; i < this.convexObjs.length; ++i) {
                this.convexObjs[i].Draw(deltaMs, this.coord, this.context);
            }
        }
        GetConvexObjsCount() {
            return this.convexObjs.length;
        }
        GetConvex(index) {
            return this.convexObjs[index];
        }
        //the maximum number of convex objects is 2;
        AddConvex(convex) {
            this.convexObjs.push(convex);
            convex.fillColor = this.convexFillColors[this.convexCounter % this.convexFillColors.length];
            ++this.convexCounter;
            if (this.convexObjs.length > 2) {
                this.convexObjs.splice(0, 1);
            }
        }
        RemoveConvex(convex) {
            if (convex instanceof GJKTutorial.Convex) {
                let index = this.convexObjs.indexOf(convex);
                if (index >= 0) {
                    this.convexObjs.splice(index, 1);
                }
            }
            else {
                this.convexObjs.splice(convex, 1);
            }
        }
    }
    GJKTutorial.Framework = Framework;
    window.onload = function () {
        let canvas = document.getElementById('canvas');
        let framework = new Framework(canvas);
        /////////////////////Default Convex Objects////////////////////
        let conv = new GJKTutorial.Convex();
        conv.AddVertex(new GJKTutorial.Vertex(new GJKTutorial.Vec2(6, 8), "a"));
        conv.AddVertex(new GJKTutorial.Vertex(new GJKTutorial.Vec2(5, 2), "b"));
        conv.AddVertex(new GJKTutorial.Vertex(new GJKTutorial.Vec2(1, 6), "c"));
        conv.name = "A";
        framework.AddConvex(conv);
        conv = new GJKTutorial.Convex();
        conv.AddVertex(new GJKTutorial.Vertex(new GJKTutorial.Vec2(6, 4), "d"));
        conv.AddVertex(new GJKTutorial.Vertex(new GJKTutorial.Vec2(2, 2), "e"));
        conv.AddVertex(new GJKTutorial.Vertex(new GJKTutorial.Vec2(5, -2), "f"));
        conv.name = "B";
        framework.AddConvex(conv);
        /////////////////////Default Convex Objects////////////////////
        /////////////////////Custom Convex Functions////////////////////
        let buttonClear = document.getElementById('ClearAllConvex');
        let buttonBeginAdd = document.getElementById('BeginAddNewConvex');
        let buttonFinishAdd = document.getElementById('FinishAddNewConvex');
        let buttonCancel = document.getElementById('CancelAddNewConvex');
        GJKTutorial.InitShowCase_DrawCustomConvex(framework, canvas, buttonClear, buttonBeginAdd, buttonFinishAdd, buttonCancel);
        /////////////////////Custom Convex Functions////////////////////
        /////////////////////Full Minkowski Difference Preview////////////////////
        let buttonToggleMinkowskiDiff = document.getElementById("MinkowskiDiffToggle");
        GJKTutorial.InitShowCase_MinkowskiDiff(framework, buttonToggleMinkowskiDiff);
        /////////////////////Full Minkowski Difference Preview////////////////////
        //////////////////////GJK Step Demonstration////////////////////////////
        let buttonGJKStep = document.getElementById("GJKStep");
        let buttonGJKUndo = document.getElementById("GJKUndoStep");
        let buttonGJKClear = document.getElementById("GJKClear");
        GJKTutorial.InitShowCase_DrawGJKStep(framework, canvas, buttonGJKStep, buttonGJKUndo, buttonGJKClear);
        //////////////////////GJK Step Demonstration////////////////////////////
        /////////////////////////Drag Convex///////////////////////////////////
        {
            let bDrag = false;
            let draggingConvexObj = null;
            let lastCood = null;
            canvas.addEventListener('mousedown', (evt) => {
                if (evt.button != 1) {
                    return;
                }
                event.preventDefault();
                bDrag = true;
                let pos = new GJKTutorial.Vec2(evt.offsetX, evt.offsetY);
                lastCood = framework.GetCoordinate().GetCoordByCanvasPos(pos);
                for (let i = 0; i < framework.GetConvexObjsCount(); ++i) {
                    let candidiateConvex = framework.GetConvex(i);
                    if (candidiateConvex.IsPointInConvex(lastCood)) {
                        draggingConvexObj = candidiateConvex;
                        break;
                    }
                }
            });
            canvas.addEventListener('mousemove', (evt) => {
                if (!bDrag || !draggingConvexObj) {
                    return;
                }
                let pos = new GJKTutorial.Vec2(evt.offsetX, evt.offsetY);
                let coord = framework.GetCoordinate().GetCoordByCanvasPos(pos);
                draggingConvexObj.Translate(coord.Sub(lastCood));
                lastCood = coord;
            });
            canvas.addEventListener('mouseup', (evt) => {
                if (evt.button != 1) {
                    return;
                }
                event.preventDefault();
                bDrag = false;
                draggingConvexObj = null;
            });
        }
        //////////////////////////////////////////////////////////////////////
    };
})(GJKTutorial || (GJKTutorial = {}));
//# sourceMappingURL=main.js.map