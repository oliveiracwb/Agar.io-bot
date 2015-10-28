// ==UserScript==
// @name        AposBot
// @namespace   AposBot
// @include     http://agar.io/*
// @version     3.645
// @grant       none
// @author      http://www.twitch.tv/apostolique
// ==/UserScript==

Array.prototype.peek = function() {
    return this[this.length - 1];
};

var sha = "efde0488cc2cc176db48dd23b28a20b90314352b";
var f = window;
var g = window.jQuery;

this.idangerDistance = 5;
this.imergesize = 5;
this.oneOrMulti = 1; // 1 for one; other for multi
this.hugeball = 10;
this.iSplitDistance = 710;

window.botList = window.botList || [];

function AposBot() {
    this.name = "AposBot 3.645"  ;

    this.toggleFollow = false;
    this.keyAction = function(key) {
        if (81 == key.keyCode) {
            this.toggleFollow = !this.toggleFollow;
        }
    };

    // Using mod function instead the prototype directly as it is very slow
    this.mod = function(num, mod) {
        if (mod & (mod - 1) === 0 && mod !== 0) {
            return num & (mod - 1);
        }
        return num < 0 ? ((num % mod) + mod) % mod : num % mod;
    };
    this.splitDistance = iSplitDistance;

    //Given an angle value that was gotten from valueAndleBased(),
    //returns a new value that scales it appropriately.
    this.paraAngleValue = function(angleValue, range) {
        return (15 / (range[1])) * (angleValue * angleValue) - (range[1] / 6);
    };

    this.computeDistance = function(x1, y1, x2, y2, s1, s2) {
        // Make sure there are no null optional params.
        s1 = s1 || 0;
        s2 = s2 || 0;
        var xdis = x1 - x2; // <--- FAKE AmS OF COURSE!
        var ydis = y1 - y2;
        var distance = Math.sqrt(xdis * xdis + ydis * ydis) - ((s1 + s2) );

        return distance;
    };

    // Get a distance that is Inexpensive on the cpu for various purpaces
    this.computeInexpensiveDistance = function(x1, y1, x2, y2, s1, s2) {
        // Make sure there are no null optional params.
        s1 = s1 || 0;
        s2 = s2 || 0;
        var xdis = x1 - x2;
        var ydis = y1 - y2;
        // Get abs quickly
        xdis = xdis < 0 ? xdis * -1 : xdis;
        ydis = ydis < 0 ? ydis * -1 : ydis;

        var distance = xdis + ydis;

        return distance;
    };

    this.compareSize = function(player1, player2, ratio) {
        return (player1.size * player1.size * ratio < player2.size * player2.size) ;
    },
    this.compareHuge = function(player1, player2, ratio) {
        if (player1.size * player1.size * ratio > player2.size * player2.size) {
            return true;
        }
        return false;
    },

    this.canSplit = function(player1, player2) {
        return this.compareSize(player1, player2, 2.8 ) && !this.compareSize(player1, player2, 20) && 
            this.compareHuge(player1, player2, hugeball) && player1.size > 80;
    };

    this.isItMe = function(player, cell) {
        if (getMode() == ":teams") {
            var currentColor = player[0].color;
            var currentRed = currentColor.substring(1,3);
            var currentGreen = currentColor.substring(3,5);
            var currentBlue = currentColor.substring(5,7);
            
            var currentTeam = this.getTeam(currentRed, currentGreen, currentBlue);

            var cellColor = cell.color;

            var cellRed = cellColor.substring(1,3);
            var cellGreen = cellColor.substring(3,5);
            var cellBlue = cellColor.substring(5,7);

            var cellTeam = this.getTeam(cellRed, cellGreen, cellBlue);

            if (currentTeam == cellTeam && !cell.isVirus()) {
                return true;
            }

        } else {
            for (var i = 0; i < player.length; i++) {
                if (cell.id == player[i].id) {
                    return true;
                }
            }
        }
        return false;
    };

    this.getTeam = function(red, green, blue) {
        if (red == "ff") {
            return 0;
        } else if (green == "ff") {
            return 1;
        }
        return 2;
    };

    this.isFood = function(blob, cell) {
        return (!cell.isVirus() && this.compareSize(cell, blob, 1.4) || (cell.size <= 40));
    };

    this.isThreat = function(blob, cell) {
        return (!cell.isVirus() && this.compareSize(blob, cell, 1.30));
    };

    this.isVirus = function(blob, cell) {
        if (blob == null) {
            if (cell.isVirus()){return true;} 
            else {return false;}
        }
        
        if (cell.isVirus()  && this.compareSize(cell, blob, 1.2)) {
            return true;
        } else if (cell.isVirus() && cell.color.substring(3,5).toLowerCase() != "ff") {
            return true;
        }
        return false;
    };

    this.isSplitTarget = function(that, blob, cell) {
        if (that.canSplit(cell, blob)) {
            return true;
        }
        return false;
    };

    this.separateListBasedOnFunction = function(that, listToUse, blob) {
        var foodElementList = [];
        var threatList = [];
        var virusList = [];
        var splitTargetList = [];

        var player = getPlayer();
        
        var mergeList = [];

        Object.keys(listToUse).forEach(function(element, index) {
            var isMe = that.isItMe(player, listToUse[element]);

            if (!isMe) {
                if (that.isFood(blob, listToUse[element]) ) {
                    //IT'S FOOD!
                    foodElementList.push(listToUse[element]);
                  
                } else if (that.isVirus(blob, listToUse[element])) {
                    //IT'S VIRUS!
                    virusList.push(listToUse[element]);
                } else if (that.isThreat(blob, listToUse[element])) {
                    //IT'S DANGER!
                    threatList.push(listToUse[element]);
                    mergeList.push(listToUse[element]);
                }
                else if (that.isSplitTarget(that, blob, listToUse[element])) {
                        drawCircle(listToUse[element].x, listToUse[element].y, listToUse[element].size + 50, 7);
                        splitTargetList.push(listToUse[element]);
                        //foodElementList.push(listToUse[element]);
                        mergeList.push(listToUse[element]);
                }
                else {if (that.isVirus(null, listToUse[element])==false) {mergeList.push(listToUse[element]);}
                    }
            }
        });

        foodList = [];
        for (var i = 0; i < foodElementList.length; i++) {
            foodList.push([foodElementList[i].x, foodElementList[i].y, foodElementList[i].size]);
        }
        
        return [foodList, threatList, virusList, splitTargetList];
    };

    this.getAll = function(blob) {
        var dotList = [];
        var player = getPlayer();
        var interNodes = getMemoryCells();

        dotList = this.separateListBasedOnFunction(this, interNodes, blob);

        return dotList;
    };

    this.clusterFood = function(foodList, blobSize) {
        var clusters = [];
        var addedCluster = false;

        //1: x
        //2: y
        //3: size or value
        //4: Angle, not set here.
        var iblobSize = (blobSize -1 ) *2;

        for (var i = 0; i < foodList.length ; i++) {
            for (var j = 0; j < clusters.length; j++) {
                if (this.computeInexpensiveDistance(foodList[i][0], foodList[i][1], clusters[j][0], clusters[j][1]) < iblobSize ) {
                    clusters[j][0] = (foodList[i][0] + clusters[j][0]) /2  ;
                    clusters[j][1] = (foodList[i][1] + clusters[j][1]) /2;
                    (clusters[j][2] > 3) ? 3 : clusters[j][2] += foodList[i][2];
                    addedCluster = true;
                    break;
                }
            }
            if (!addedCluster) {
                clusters.push([foodList[i][0], foodList[i][1], foodList[i][2], 0]);
            }
            addedCluster = false;
        }
        return clusters;
    };

    this.getAngle = function(x1, y1, x2, y2) {
        //Handle vertical and horizontal lines.

        if (x1 == x2) {
            if (y1 < y2) {
                return 270; //aqui100 271
                //return 89;
            } else {
                return 90; //aqui100 89
            }
        }

        return (Math.round(Math.atan2(-(y1 - y2), -(x1 - x2)) / Math.PI * 180 + 180));
    };

    this.slope = function(x1, y1, x2, y2) {
        //var m = ;
        return (y1 - y2) / (x1 - x2);
    };

    this.slopeFromAngle = function(degree) {
        /*
        if (degree == 270) {
            degree = 270;
        } else if (degree == 90) {
            degree = 90;
        }*/
        return Math.tan((degree - 180) / 180 * Math.PI);
    };

    //Given two points on a line, finds the slope of a perpendicular line crossing it.
    this.inverseSlope = function(x1, y1, x2, y2) {
        return (-1) /  this.slope(x1, y1, x2, y2);
    };

    //Given a slope and an offset, returns two points on that line.
    this.pointsOnLine = function(slope, useX, useY, distance) {
        var b = useY - slope * useX;
        var r = Math.sqrt(1 + slope * slope);

        var newX1 = (useX + (distance / r));
        var newY1 = (useY + ((distance * slope) / r));
        var newX2 = (useX + ((-distance) / r));
        var newY2 = (useY + (((-distance) * slope) / r));

        return [
            [newX1, newY1],
            [newX2, newY2]
        ];
    };

    this.followAngle = function(angle, useX, useY, distance) {
        var slope = this.slopeFromAngle(angle);
        var coords = this.pointsOnLine(slope, useX, useY, distance);

        var side = this.mod(angle - 90, 360);
        if (side < 180) {
            return coords[1];
        } else {
            return coords[0];
        }
    };

    this.angleIsWithin = function(angle, range) {
        var diff = this.mod(this.rangeToAngle(range) - angle, 360);
        if (diff >= 0 && diff <= range[1]) {
            return true;
        }
        return false;
    };

    this.rangeToAngle = function(range) {
        return this.mod(range[0] + range[1], 360);
    };

    this.computeAngleRanges = function(blob1, blob2) {
        var mainAngle = this.getAngle(blob1.x, blob1.y, blob2.x, blob2.y);
        var leftAngle = this.mod(mainAngle - 90, 360);
        var rightAngle = this.mod(mainAngle + 90, 360);

        var blob1Left = this.followAngle(leftAngle, blob1.x, blob1.y, blob1.size);
        var blob1Right = this.followAngle(rightAngle, blob1.x, blob1.y, blob1.size);

        var blob2Left = this.followAngle(rightAngle, blob2.x, blob2.y, blob2.size);
        var blob2Right = this.followAngle(leftAngle, blob2.x, blob2.y, blob2.size);

        var blob1AngleLeft = this.getAngle(blob2.x, blob2.y, blob1Left[0], blob1Left[1]);
        var blob1AngleRight = this.getAngle(blob2.x, blob2.y, blob1Right[0], blob1Right[1]);

        var blob2AngleLeft = this.getAngle(blob1.x, blob1.y, blob2Left[0], blob2Left[1]);
        var blob2AngleRight = this.getAngle(blob1.x, blob1.y, blob2Right[0], blob2Right[1]);

        var blob1Range = this.mod(blob1AngleRight - blob1AngleLeft, 360);
        var blob2Range = this.mod(blob2AngleRight - blob2AngleLeft, 360);

        var tempLine = this.followAngle(blob2AngleLeft, blob2Left[0], blob2Left[1], 400);

        if ((blob1Range / blob2Range) > 1) {
            //drawPoint(blob1Left[0], blob1Left[1], 3, "");
            //drawPoint(blob1Right[0], blob1Right[1], 3, "");
            //drawPoint(blob1.x, blob1.y, 3, "" + blob1Range + ", " + blob2Range + " R: " + (Math.round((blob1Range / blob2Range) * 1000) / 1000));
        }

        //drawPoint(blob2.x, blob2.y, 3, "" + blob1Range);
    };

    //TODO: Don't let this function do the radius math.
    // [params] eu, dangerCell, split-danger-distance
    this.getEdgeLinesFromPoint = function(blob1, blob2, radius) {
        var px = blob1.x;
        var py = blob1.y;

        var cx = blob2.x;
        var cy = blob2.y;

        var shouldInvert = false;

        var tempRadius = this.computeDistance(px, py, cx, cy);
        if (tempRadius <= radius) {
            radius = tempRadius -5;
            shouldInvert = true;
        }

        var dx = cx - px;
        var dy = cy - py;
        var dd = Math.sqrt(dx * dx + dy * dy);
        var a = Math.asin(radius / dd);
        var b = Math.atan2(dy, dx);

        var t = b - a;
        var ta = {
            x: radius * Math.sin(t),
            y: radius * -Math.cos(t)
        };

        t = b + a;
        var tb = {
            x: radius * -Math.sin(t),
            y: radius * Math.cos(t)
        };

        var angleLeft = this.getAngle(cx + ta.x, cy + ta.y, px, py);
        var angleRight = this.getAngle(cx + tb.x, cy + tb.y, px, py);
        var angleDistance = this.mod(angleRight - angleLeft, 360);

        if (shouldInvert) {
            var temp = angleLeft;
            angleLeft = this.mod(angleRight + 180, 360);
            angleRight = this.mod(temp + 180, 360);
            angleDistance = this.mod(angleRight - angleLeft, 360);
        }

        return [angleLeft, angleDistance, [cx + tb.x, cy + tb.y],
            [cx + ta.x, cy + ta.y]
        ];
    };

    this.invertAngle = function(range) { // Where are you getting all of these vars from? (badAngles and angle)
        return [this.rangeToAngle(badAngles[i]), this.mod(badAngles[i][0] - angle, 360)];
    },

    this.addWall = function(listToUse, blob) {
        var distanceFromWallY = 2000;
        var distanceFromWallX = 2000;
        if (blob.x < getMapStartX() + distanceFromWallX) {
            //LEFT
            ////console.log("Left");
            listToUse.push([
                [115, true],
                [245, false], this.computeInexpensiveDistance(getMapStartX(), blob.y, blob.x, blob.y)
            ]);
            var lineLeft = this.followAngle(115, blob.x, blob.y, 190 + blob.size);
            var lineRight = this.followAngle(245, blob.x, blob.y, 190 + blob.size);
            drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
            drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
            drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
        }
        if (blob.y < getMapStartY() + distanceFromWallY) {
            //TOP
            ////console.log("TOP");
            listToUse.push([
                [205, true],
                [335, false], this.computeInexpensiveDistance(blob.x, getMapStartY(), blob.x, blob.y)
            ]);
            var lineLeft = this.followAngle(205, blob.x, blob.y, 190 + blob.size);
            var lineRight = this.followAngle(335, blob.x, blob.y, 190 + blob.size);
            drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
            drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
            drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
        }
        if (blob.x > getMapEndX() - distanceFromWallX) {
            //RIGHT
            ////console.log("RIGHT");
            listToUse.push([
                [295, true],
                [65, false], this.computeInexpensiveDistance(getMapEndX(), blob.y, blob.x, blob.y)
            ]);
            var lineLeft = this.followAngle(295, blob.x, blob.y, 190 + blob.size);
            var lineRight = this.followAngle(65, blob.x, blob.y, 190 + blob.size);
            drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
            drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
            drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
        }
        if (blob.y > getMapEndY() - distanceFromWallY) {
            //BOTTOM
            ////console.log("BOTTOM");
            listToUse.push([
                [25, true],
                [155, false], this.computeInexpensiveDistance(blob.x, getMapEndY(), blob.x, blob.y)
            ]);
            var lineLeft = this.followAngle(25, blob.x, blob.y, 190 + blob.size);
            var lineRight = this.followAngle(155, blob.x, blob.y, 190 + blob.size);
            drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
            drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
            drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
        }
        return listToUse;
    };

    //listToUse contains angles in the form of [angle, boolean].
    //boolean is true when the range is starting. False when it's ending.
    //range = [[angle1, true], [angle2, false]]

    this.getAngleIndex = function(listToUse, angle) {
        if (listToUse.length === 0) {
            return 0;
        }

        for (var i = 0; i < listToUse.length; i++) {
            if (angle <= listToUse[i][0]) {
                return i;
            }
        }

        return listToUse.length;
    };

    this.addAngle = function(listToUse, range) {
        //#1 Find first open element
        //#2 Try to add range1 to the list. If it is within other range, don't add it, set a boolean.
        //#3 Try to add range2 to the list. If it is withing other range, don't add it, set a boolean.

        //TODO: Only add the new range at the end after the right stuff has been removed.

        var newListToUse = listToUse.slice();

        var startIndex = 1;

        if (newListToUse.length > 0 && !newListToUse[0][1]) {
            startIndex = 0;
        }

        var startMark = this.getAngleIndex(newListToUse, range[0][0]);
        var startBool = this.mod(startMark, 2) != startIndex;

        var endMark = this.getAngleIndex(newListToUse, range[1][0]);
        var endBool = this.mod(endMark, 2) != startIndex;

        var removeList = [];

        if (startMark != endMark) {
            //Note: If there is still an error, this would be it.
            var biggerList = 0;
            if (endMark == newListToUse.length) {
                biggerList = 1;
            }

            for (var i = startMark; i < startMark + this.mod(endMark - startMark, newListToUse.length + biggerList); i++) {
                removeList.push(this.mod(i, newListToUse.length));
            }
        } else if (startMark < newListToUse.length && endMark < newListToUse.length) {
            var startDist = this.mod(newListToUse[startMark][0] - range[0][0], 360);
            var endDist = this.mod(newListToUse[endMark][0] - range[1][0], 360);

            if (startDist < endDist) {
                for (var i = 0; i < newListToUse.length; i++) {
                    removeList.push(i);
                }
            }
        }

        //aqui
        //removeList.sort(function(a, b){return b-a;});

        for (var i = 0; i < removeList.length; i++) {
            newListToUse.splice(removeList[i], 1);
        }

        if (startBool) {
            newListToUse.splice(this.getAngleIndex(newListToUse, range[0][0]), 0, range[0]);
        }
        if (endBool) {
            newListToUse.splice(this.getAngleIndex(newListToUse, range[1][0]), 0, range[1]);
        }

        return newListToUse;
    };
    // Eu, perigo, index_perigo, split-danger-distance
    this.getAngleRange = function(blob1, blob2, index, radius) {
        var angleStuff = this.getEdgeLinesFromPoint(blob1, blob2, radius);

        var leftAngle = angleStuff[0];
        var rightAngle = this.rangeToAngle(angleStuff);
        var difference = angleStuff[1];

        drawPoint(angleStuff[2][0], angleStuff[2][1], 3, "" );
        drawPoint(angleStuff[3][0], angleStuff[3][1], 3, "" );

        ////console.log("Adding badAngles: " + leftAngle + ", " + rightAngle + " diff: " + difference);

        var lineLeft = this.followAngle(leftAngle, blob1.x, blob1.y, idangerDistance + blob1.size - index * 10);
        var lineRight = this.followAngle(rightAngle, blob1.x, blob1.y, idangerDistance + blob1.size - index * 10);

        if (blob2.isVirus()) {
            drawLine(blob1.x, blob1.y, lineLeft[0], lineLeft[1], 6);
            drawLine(blob1.x, blob1.y, lineRight[0], lineRight[1], 6);
            drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob1.x, blob1.y, 6);
        } else if(getCells().hasOwnProperty(blob2.id)) {
            drawLine(blob1.x, blob1.y, lineLeft[0], lineLeft[1], 0);
            drawLine(blob1.x, blob1.y, lineRight[0], lineRight[1], 0);
            drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob1.x, blob1.y, 0);
        } else {
            drawLine(blob1.x, blob1.y, lineLeft[0], lineLeft[1], 3);
            drawLine(blob1.x, blob1.y, lineRight[0], lineRight[1], 3);
            drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob1.x, blob1.y, 3);
        }

        return [leftAngle, difference];
    };

    //Given a list of conditions, shift the angle to the closest available spot respecting the range given.
    this.shiftAngle = function(listToUse, angle, range) {
        //TODO: shiftAngle needs to respect the range! DONE?
        for (var i = 0; i < listToUse.length; i++) {
            if (this.angleIsWithin(angle, listToUse[i])) {
                ////console.log("Shifting needed!");

                var angle1 = listToUse[i][0];
                var angle2 = this.rangeToAngle(listToUse[i]);

                var dist1 = this.mod(angle - angle1, 360);
                var dist2 = this.mod(angle2 - angle, 360);

                if (dist1 <= dist2) {
                    if (this.angleIsWithin(angle1, range)) {
                        return angle1;
                    } else {
                        return angle2;
                    }
                } else {
                    if (this.angleIsWithin(angle2, range)) {
                        return angle2;
                    } else {
                        return angle1;
                    }
                }
            }
        }
        ////console.log("No Shifting Was needed!");
        return angle;
    };

    /**
     * This is the main bot logic. This is called quite often.
     * @return A 2 dimensional array with coordinates for every cells.  [[x, y], [x, y]]
     */
    this.mainLoop = function() {
        var player = getPlayer();
        var interNodes = getMemoryCells();
        var enemyCanSplit = false;  
        if ( /*!toggle*/ 1) {
            //The following code converts the mouse position into an
            //absolute game coordinate.
            var useMouseX = screenToGameX(getMouseX());
            var useMouseY = screenToGameY(getMouseY());
            tempPoint = [useMouseX, useMouseY, 1];

            //The current destination that the cells were going towards.
            var tempMoveX = getPointX();
            var tempMoveY = getPointY();

            drawLine(getX() - (1920 / 2) / getZoomlessRatio(), getY() - (1080 / 2) / getZoomlessRatio(), getX() + (1920 / 2) / getZoomlessRatio(), getY() - (1080 / 2) / getZoomlessRatio(), 7);
            drawLine(getX() - (1920 / 2) / getZoomlessRatio(), getY() + (1080 / 2) / getZoomlessRatio(), getX() + (1920 / 2) / getZoomlessRatio(), getY() + (1080 / 2) / getZoomlessRatio(), 7);
            drawLine(getX() - (1920 / 2) / getZoomlessRatio(), getY() - (1080 / 2) / getZoomlessRatio(), getX() - (1920 / 2) / getZoomlessRatio(), getY() + (1080 / 2) / getZoomlessRatio(), 7);
            drawLine(getX() + (1920 / 2) / getZoomlessRatio(), getY() - (1080 / 2) / getZoomlessRatio(), getX() + (1920 / 2) / getZoomlessRatio(), getY() + (1080 / 2) / getZoomlessRatio(), 7);

            //This variable will be returned at the end.
            //It will contain the destination choices for all the cells.
            //BTW!!! ERROR ERROR ABORT MISSION!!!!!!! READ BELOW -----------
            //
            //SINCE IT'S STUPID NOW TO ASK EACH CELL WHERE THEY WANT TO GO,
            //THE BOT SHOULD SIMPLY PICK ONE AND THAT'S IT, I MEAN WTF....
            var destinationChoices = []; //destination, size, danger

            //Just to make sure the player is alive.
            mysize = player[0].size;
            if (player.length > 0) {
                for (var k = 0; k < 1; k++) {
                    drawCircle(player[k].x, player[k].y, player[k].size + this.splitDistance, 5);

                    //loop through everything that is on the screen and
                    //separate everything in it's own category.
                    var allIsAll = this.getAll(player[k]);

                    //The food stored in element 0 of allIsAll
                    var allPossibleFood = allIsAll[0];
                    //The threats are stored in element 1 of allIsAll
                    var allPossibleThreats = allIsAll[1];
                    //The viruses are stored in element 2 of allIsAll
                    var allPossibleViruses = allIsAll[2];
                    for (var i = 0; i < allPossibleViruses.length; i++) {
                            drawPoint(allPossibleViruses[i].x, allPossibleViruses[i].y, 5, "" + allPossibleViruses[i].size);
                    }
                    //The bot works by removing angles in which it is too
                    //dangerous to travel towards to.
                    var badAngles = [];
                    var obstacleList = [];

                    var isSafeSpot = true;
                    var isMouseSafe = true;

                    var clusterAllFood = this.clusterFood(allPossibleFood, player[k].size );

                    ////console.log("Looking for enemies!");

                    //Loop through all the cells that were identified as threats.
                    for (var i = 0; i < allPossibleThreats.length; i++) {
                        // Acho que é aqui
                        // player[k].size
                        var enemyDistance = this.computeDistance(allPossibleThreats[i].x, allPossibleThreats[i].y, player[k].x, player[k].y, allPossibleThreats[i].size +15);
                        //aqui88
                        allPossibleThreats[i].enemyDist = enemyDistance;
                    }

                    // aqui88
                      allPossibleThreats.sort(function(a, b){
                        return a.enemyDist-b.enemyDist;
                    })

                    for (var i = 0; i < allPossibleThreats.length; i++) {

                        var enemyDistance = this.computeDistance(allPossibleThreats[i].x, allPossibleThreats[i].y, player[k].x, player[k].y) -1;

                        var splitDangerDistance = allPossibleThreats[i].size + this.splitDistance + idangerDistance;

                        var normalDangerDistance = allPossibleThreats[i].size + idangerDistance;
                        
                        //aqui88                             
                        var shiftDistance = player[k].size +15;

                        ////console.log("Found distance.");
                         
                        enemyCanSplit = this.canSplit(player[k], allPossibleThreats[i]);
                        
                        var secureDistance = (enemyCanSplit ? splitDangerDistance : normalDangerDistance  );
                        //aqui100
                        
                        for (var j = clusterAllFood.length - 1; j >= 0 ; j--) {
                            if (this.computeDistance(allPossibleThreats[i].x, allPossibleThreats[i].y, clusterAllFood[j][0], clusterAllFood[j][1]) < ( secureDistance  ) + shiftDistance +(player[0].size * 4))
                                clusterAllFood.splice(j, 1);
                        }

                        ////console.log("Removed some food.");

                        if (enemyCanSplit) {
                            drawCircle(allPossibleThreats[i].x, allPossibleThreats[i].y, splitDangerDistance, 0);
                            drawCircle(allPossibleThreats[i].x, allPossibleThreats[i].y, splitDangerDistance + shiftDistance, 6);
                        } else {
                            drawCircle(allPossibleThreats[i].x, allPossibleThreats[i].y, normalDangerDistance, 3);
                            drawCircle(allPossibleThreats[i].x, allPossibleThreats[i].y, normalDangerDistance + shiftDistance, 6);
                        }

                        if (allPossibleThreats[i].danger && getLastUpdate() - allPossibleThreats[i].dangerTimeOut > 2000) {
                            allPossibleThreats[i].danger = false;
                        }

                        if ((enemyCanSplit && enemyDistance < splitDangerDistance) || (enemyCanSplit && allPossibleThreats[i].danger)) {

                            badAngles.push(this.getAngleRange(player[k], allPossibleThreats[i], i, splitDangerDistance).concat(allPossibleThreats[i].enemyDist));

                        } else if ((!enemyCanSplit && enemyDistance < normalDangerDistance) || (!enemyCanSplit && allPossibleThreats[i].danger)) {
                            badAngles.push(this.getAngleRange(player[k], allPossibleThreats[i], i, normalDangerDistance).concat(allPossibleThreats[i].enemyDist));
                        } else if (enemyCanSplit && enemyDistance < splitDangerDistance + shiftDistance) {
                            var tempOb = this.getAngleRange(player[k], allPossibleThreats[i], i, splitDangerDistance + shiftDistance);
                            var angle1 = tempOb[0];
                            var angle2 = this.rangeToAngle(tempOb);
                            obstacleList.push([[angle1, true], [angle2, false]]);
                        } else if (!enemyCanSplit && enemyDistance < normalDangerDistance + shiftDistance) {
                            var tempOb = this.getAngleRange(player[k], allPossibleThreats[i], i, normalDangerDistance + shiftDistance);
                            var angle1 = tempOb[0];
                            var angle2 = this.rangeToAngle(tempOb);

                            obstacleList.push([[angle1, true], [angle2, false]]);
                        }
                        ////console.log("Done with enemy: " + i);
                    }

                    ////console.log("Done looking for enemies!");

                    var goodAngles = [];
                    var stupidList = [];

                    for (var i = 0; i < allPossibleViruses.length; i++) {
                        if (player[k].size < allPossibleViruses[i].size) {
                            drawCircle(allPossibleViruses[i].x, allPossibleViruses[i].y, allPossibleViruses[i].size , 3);
                            drawCircle(allPossibleViruses[i].x, allPossibleViruses[i].y, allPossibleViruses[i].size * 2, 6);

                        } else {
                            drawCircle(allPossibleViruses[i].x, allPossibleViruses[i].y, player[k].size + 50, 3);
                            drawCircle(allPossibleViruses[i].x, allPossibleViruses[i].y, player[k].size * 2, 6);
                        }
                    }

                    for (var i = 0; i < allPossibleViruses.length; i++) {
                        var virusDistance = this.computeDistance(allPossibleViruses[i].x, allPossibleViruses[i].y, player[k].x, player[k].y);
                        if (player[k].size < allPossibleViruses[i].size) {
                            if (virusDistance < (allPossibleViruses[i].size * 2)) {
                                var tempOb = this.getAngleRange(player[k], allPossibleViruses[i], i, allPossibleViruses[i].size + 10);
                                var angle1 = tempOb[0];
                                var angle2 = this.rangeToAngle(tempOb);
                                obstacleList.push([[angle1, true], [angle2, false]]);
                            }
                        } else {
                            if (virusDistance < (player[k].size * 2)) {
                                var tempOb = this.getAngleRange(player[k], allPossibleViruses[i], i, player[k].size + 50);
                                var angle1 = tempOb[0];
                                var angle2 = this.rangeToAngle(tempOb);
                                obstacleList.push([[angle1, true], [angle2, false]]);
                            }
                        }
                    }

                    if (badAngles.length > 0) {
                        //NOTE: This is only bandaid wall code. It's not the best way to do it.
                        stupidList = this.addWall(stupidList, player[k]);
                    }

                    for (var i = 0; i < badAngles.length; i++) {
                        var angle1 = badAngles[i][0];
                        var angle2 = this.rangeToAngle(badAngles[i]);
                        stupidList.push([[angle1, true], [angle2, false], badAngles[i][2]]);
                    }

                    //stupidList.push([[45, true], [135, false]]);
                    //stupidList.push([[10, true], [200, false]]);

                    stupidList.sort(function(a, b){
                        ////console.log("Distance: " + a[2] + ", " + b[2]);
                        return a[2]-b[2];
                    });

                    ////console.log("Added random noob stuff.");

                    var sortedInterList = [];
                    var sortedObList = [];

                    for (var i = 0; i < stupidList.length; i++) {
                        ////console.log("Adding to sorted: " + stupidList[i][0][0] + ", " + stupidList[i][1][0]);
                        var tempList = this.addAngle(sortedInterList, stupidList[i]);

                        if (tempList.length === 0) {
                            //console.log("MAYDAY IT'S HAPPENING!");
                            break;
                        } else {
                            sortedInterList = tempList;
                        }
                    }

                    for (var i = 0; i < obstacleList.length; i++) {
                        sortedObList = this.addAngle(sortedObList, obstacleList[i]);

                        if (sortedObList.length === 0) {
                            break;
                        }
                    }

                    var offsetI = 0;
                    var obOffsetI = 1;

                    if (sortedInterList.length > 0 && sortedInterList[0][1]) {
                        offsetI = 1;
                    }
                    if (sortedObList.length > 0 && sortedObList[0][1]) {
                        obOffsetI = 0;
                    }

                    var goodAngles = [];
                    var obstacleAngles = [];

                    for (var i = 0; i < sortedInterList.length; i += 2) {
                        var angle1 = sortedInterList[this.mod(i + offsetI, sortedInterList.length)][0];
                        var angle2 = sortedInterList[this.mod(i + 1 + offsetI, sortedInterList.length)][0];
                        var diff = this.mod(angle2 - angle1, 360);
                        goodAngles.push([angle1, diff]);
                    }

                    for (var i = 0; i < sortedObList.length; i += 2) {
                        var angle1 = sortedObList[this.mod(i + obOffsetI, sortedObList.length)][0];
                        var angle2 = sortedObList[this.mod(i + 1 + obOffsetI, sortedObList.length)][0];
                        var diff = this.mod(angle2 - angle1, 360);
                        obstacleAngles.push([angle1, diff]);
                    }

                    for (var i = 0; i < goodAngles.length; i++) {
                        var line1 = this.followAngle(goodAngles[i][0], player[k].x, player[k].y, 100 + player[k].size);
                        var line2 = this.followAngle(this.mod(goodAngles[i][0] + goodAngles[i][1], 360), player[k].x, player[k].y, 100 + player[k].size);
                        drawLine(player[k].x, player[k].y, line1[0], line1[1], 1);
                        drawLine(player[k].x, player[k].y, line2[0], line2[1], 1);

                        drawArc(line1[0], line1[1], line2[0], line2[1], player[k].x, player[k].y, 1);

                        //drawPoint(player[0].x, player[0].y, 2, "");

                        drawPoint(line1[0], line1[1], 0, "" + i + ": 0");
                        drawPoint(line2[0], line2[1], 0, "" + i + ": 1");
                    }

                    for (var i = 0; i < obstacleAngles.length; i++) {
                        var line1 = this.followAngle(obstacleAngles[i][0], player[k].x, player[k].y, 50 + player[k].size);
                        var line2 = this.followAngle(this.mod(obstacleAngles[i][0] + obstacleAngles[i][1], 360), player[k].x, player[k].y, 50 + player[k].size);
                        drawLine(player[k].x, player[k].y, line1[0], line1[1], 6);
                        drawLine(player[k].x, player[k].y, line2[0], line2[1], 6);

                        drawArc(line1[0], line1[1], line2[0], line2[1], player[k].x, player[k].y, 6);

                        //drawPoint(player[0].x, player[0].y, 2, "");

                        drawPoint(line1[0], line1[1], 0, "" + i + ": 0");
                        drawPoint(line2[0], line2[1], 0, "" + i + ": 1");
                    }

                    if (this.toggleFollow && goodAngles.length === 0) {
                        //This is the follow the mouse mode
                        var distance = this.computeDistance(player[k].x, player[k].y, tempPoint[0], tempPoint[1]);

                        var shiftedAngle = this.shiftAngle(obstacleAngles, this.getAngle(tempPoint[0], tempPoint[1], player[k].x, player[k].y), [0, 360]);

                        var destination = this.followAngle(shiftedAngle, player[k].x, player[k].y, distance);

                        destinationChoices = destination;
                        drawLine(player[k].x, player[k].y, destination[0], destination[1], 1);
                        //tempMoveX = destination[0];
                        //tempMoveY = destination[1];

                    } else if (goodAngles.length > 0) {
                        var bIndex = goodAngles[0];
                        var biggest = goodAngles[0][1];
                        for (var i = 1; i < goodAngles.length; i++) {
                            var size = goodAngles[i][1];
                            if (size > biggest) {
                                biggest = size;
                                bIndex = goodAngles[i];
                            }
                        }
                        var perfectAngle = this.mod(bIndex[0] + bIndex[1] / (1.8), 360);

                        perfectAngle = this.shiftAngle(obstacleAngles, perfectAngle, bIndex);

                        var line1 = this.followAngle(perfectAngle, player[k].x, player[k].y, verticalDistance());

                        destinationChoices = line1;
                        drawLine(player[k].x, player[k].y, line1[0], line1[1], 7);
                        //tempMoveX = line1[0];
                        //tempMoveY = line1[1];
                    } else if (badAngles.length > 0 && goodAngles.length === 0) {
                        //When there are enemies around but no good angles
                        //You're likely screwed. (This should never happen.)

                        //console.log("Failed");
                        destinationChoices = [player[0].x, player[0].y];
                        
                    } else if (clusterAllFood.length > 0) {
                        for (var i = 0; i < clusterAllFood.length; i++) {
                                var clusterAngle = this.getAngle(clusterAllFood[i][0], clusterAllFood[i][1], player[k].x, player[k].y);

                                clusterAllFood[i][2] = clusterAllFood[i][2] * 6 - this.computeDistance(clusterAllFood[i][0], clusterAllFood[i][1], player[k].x, player[k].y);
                                clusterAllFood[i][3] = clusterAngle;

                                drawPoint(clusterAllFood[i][0], clusterAllFood[i][1], 1, "");
                        }

                        var bestFoodI = 0;
                        var bestFood = clusterAllFood[0][2];
                        for (var i = 1; i < clusterAllFood.length; i++) {
                            if (bestFood < clusterAllFood[i][2]) {
                                bestFood = clusterAllFood[i][2];
                                bestFoodI = i;
                            }
                        }

                        var distance = this.computeDistance(player[k].x, player[k].y, clusterAllFood[bestFoodI][0], clusterAllFood[bestFoodI][1]);
                        var shiftedAngle = this.shiftAngle(obstacleAngles, this.getAngle(clusterAllFood[bestFoodI][0], clusterAllFood[bestFoodI][1], player[k].x, player[k].y), [0, 360]);
                        var destination = this.followAngle(shiftedAngle, player[k].x, player[k].y, distance);
                        destinationChoices = destination;
                        drawLine(player[k].x, player[k].y, destination[0], destination[1], 1);
                    } /*else {
                        //If there are no enemies around and no food to eat.
                        destinationChoices = [tempMoveX, tempMoveY];
                    }*/
                    drawPoint(tempPoint[0], tempPoint[1], tempPoint[2], "");
                    tempPoint[2] = 1;

                    ////console.log("Done working on blob: " + i);
                }

            }
            ////console.log("MOVING RIGHT NOW!");

            ////console.log("______Never lied ever in my life.");

            return destinationChoices;
        }
    };
};
window.botList.push(new AposBot());

window.updateBotList(); //This function might not exist yet.
