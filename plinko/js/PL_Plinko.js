/**
 * Created with JetBrains WebStorm.
 * User: swildrick
 * Date: 2/7/13
 * Time: 11:06 AM
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function () {
    //tells animation to stop running when user tabs off
    window.requestAnimFrame = (function()
    {
        return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback, /* DOMElement */ element)
        {
            window.setTimeout(callback, 1000 / 60);
        };
    })();

    //ARRAYS
    var bricksScheduledForRemoval = Array();
    //audio
    var bounceAudio = new Audio('assets/audio/bounce.mp3');
    //booleans
    
    var isMouseDown = false;
    var hitBottom = false;
    //box2d items
    var world;//define how items live
    var bodyDef;//add objects to display list
    //var ball;//add objects to display list
    var b2Vec2;//definition of world
    var worldScale = 30;//
    //canvas items
    var canvas;
    var ctx;
    //fixed assets
    var fixDef;//items that do not move
    var headDef;
    var bucket;//item that hold balls that define if win/lose
    var ground;//physical item on bottom of game
    var level;//physical item on bottom of game
    var cover;//physical item on bottom of game
    var leftWall;
    var rightWall;
    //images
    var zombieHead = new Image();
    var spokeImage = new Image();
    var base_image = new Image();
    var brick_image = new Image();
    //numbers
    var index = -1;
    var mouseX;
    var mouseY;
    var mousePVec;
    var isMouseDown;
    var mouseJoint;
    var selectedBody;

    function init()
    {
        canvas = document.getElementById("gameCanvas");
        ctx = canvas.getContext("2d");

        zombieHead.src = $pl.baseHref + "Content/images/Reveals/PL_Plinko/zombieHead.png";
        spokeImage.src = $pl.baseHref + "Content/images/Reveals/PL_Plinko/spoke.png";
        base_image.src = $pl.baseHref + "Content/images/Reveals/PL_Plinko/wood.png";
        brick_image.src = $pl.baseHref + "Content/images/Reveals/PL_Plinko/brick.png";

        //pulling in the properties of the box2d world
        b2Vec2 = Box2D.Common.Math.b2Vec2
            , b2AABB = Box2D.Collision.b2AABB
            , b2BodyDef = Box2D.Dynamics.b2BodyDef
            , b2Body = Box2D.Dynamics.b2Body
            , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
            , b2Fixture = Box2D.Dynamics.b2Fixture
            , b2World = Box2D.Dynamics.b2World
            , b2MassData = Box2D.Collision.Shapes.b2MassData
            , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
            , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
            , b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
            , b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

        world = new b2World(new b2Vec2(0, 75), false);

        //setup debug draw to actually run physics
        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(document.getElementById("gameCanvas").getContext("2d"));
        debugDraw.SetDrawScale(worldScale);
        debugDraw.SetFillAlpha(0.3);
        debugDraw.SetAlpha(1);
        debugDraw.SetLineThickness(25.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        world.SetDebugDraw(debugDraw);

        window.setInterval(removeObjScheduledForRemoval, 100);

        setupBottomListener();
        defineContainer();
        defineFixtures();
        defineBuckets();
        definelevel();
        defineCover();

        if(winner)
        {
            defineWinnerPolys();
        }
        else
        {
            defineNonWinnerPolys();
        }
        createBox();
    }


    //removes items that are setup to be destroyed
    function removeObjScheduledForRemoval()
    {
        for(var i = 0; i <= index; i++){
            world.DestroyBody(bricksScheduledForRemoval[i]);
            bricksScheduledForRemoval[i] = null;
        }
        bricksScheduledForRemoval = Array();
        index = -1;
    }

    //creates ball and adds listeners to window
    function createBox()
    {
        canvas.addEventListener("mousedown", handleMouseDown, true);
        canvas.addEventListener("touchstart", handleMouseDown, true);
        canvas.addEventListener("mouseup", handleMouseUp, true);

        headDef = new b2FixtureDef;
        headDef.density = 10;
        headDef.friction = 2;
        headDef.restitution = 0.4;
        headDef.isSensor = false;
        headDef.shape = new b2CircleShape(0.4);

        var ball = new b2BodyDef;
        ball.position.Set(10, 0);
        ball.userData = zombieHead;
        ball.type = b2Body.b2_dynamicBody;
        ball.active = true;
        isMouseDown = true;

        hitBottom = false;

        world.CreateBody(ball).CreateFixture(headDef);
    }

    function definelevel()
    {
        //setting up the ground floor
        level = new b2FixtureDef;
        level.shape = new b2PolygonShape;
        level.userData = level;
        level.isSensor = false;
        level.shape.SetAsBox(3, 0.05);

        bodyDef = new b2BodyDef;
        bodyDef.position.x = 10;
        bodyDef.position.y = 2;
        bodyDef.type = b2Body.b2_staticBody;
        world.CreateBody(bodyDef).CreateFixture(level);
    }

    function defineCover()
    {
        //setting up the ground floor
        cover = new b2FixtureDef;
        cover.shape = new b2PolygonShape;
        cover.shape.SetAsBox(8, 1);

        bodyDef = new b2BodyDef;
        bodyDef.position.x = 10;
        bodyDef.position.y = 23;
        bodyDef.active = false;
        bodyDef.userData = cover;
        bodyDef.type = b2Body.b2_staticBody;
        world.CreateBody(bodyDef).CreateFixture(cover);
    }

    function defineFixtures()
    {
        //defining the fixtures/spokes of world
        fixDef = new b2FixtureDef;
        fixDef.density = 2.0;
        fixDef.friction = 1;
        fixDef.isSensor = true;
        fixDef.restitution = 0.4;
        fixDef.isSensor = false;
        fixDef.shape = new b2CircleShape(0.4);

        //placing the spokes
        var xPos = 1.9;
        var yPos = 5;
        var b = 0;
        var c = 9;
        var otherRow = false;
        for(var j = 0; j < 68; ++j)
        {
            if(b == c)
            {
                b = 0;
                yPos = yPos + 2;
                if(otherRow)
                {
                    c = 9;
                    otherRow = false;
                    xPos = 1.9;
                }
                else
                {
                    c = 8;
                    otherRow = true;
                    xPos = 2.75;
                }
            }
            b++;

            bodyDef = new b2BodyDef;
            bodyDef.type = b2Body.b2_staticBody;
            bodyDef.position.x = xPos;
            bodyDef.position.y = yPos;
            bodyDef.userData = spokeImage;
            world.CreateBody(bodyDef).CreateFixture(fixDef);
            xPos = xPos + 2;
        }
    }

    function defineBuckets()
    {
        var xPos = 1.75;
        var yPos = 19;

        //setting up the winner/nonwin buckets
        bucket = new b2FixtureDef;
        bucket.density = 1.0; // The density, usually in kg/m^2.
        bucket.friction = 0.5; // is the force resisting the relative motion of solid surfaces
        bucket.isSensor = false;
        bucket.restitution = 0.5;
        bucket.userData = bucket;
        bucket.shape = new b2PolygonShape;
        bucket.shape.SetAsBox(0.4, 1.7, 1, 1);

        //rectangles for buckets
        xPos = 2.8;
        for(var j = 0; j < 8; ++j)
        {
            bodyDef = new b2BodyDef;
            bodyDef.active = true; //Does this body start out active?
            //bodyDef.allowSleep = true;
            bodyDef.type = b2Body.b2_staticBody;
            bodyDef.position.x = xPos;
            bodyDef.position.y = yPos + 3;
            bodyDef.userData = bucket;
            bodyDef.fixedRotation = false;
            bodyDef.active = true;
            world.CreateBody(bodyDef).CreateFixture(bucket);
            xPos = xPos + 2;
        }
    }

    function defineContainer()
    {
        //setting up the ground floor
        ground = new b2FixtureDef;
        ground.shape = new b2PolygonShape;
        ground.userData = ground;
        ground.shape.SetAsBox(9.8, 0.1, 100, 1000);

        bodyDef = new b2BodyDef;
        bodyDef.position.x = 10;
        bodyDef.position.y = 23.9;
        bodyDef.userData = ground;
        bodyDef.type = b2Body.b2_staticBody;
        world.CreateBody(bodyDef).CreateFixture(ground);

        leftWall = new b2FixtureDef;
        leftWall.shape = new b2PolygonShape;
        leftWall.shape.SetAsBox(0.1, 13);

        bodyDef = new b2BodyDef;
        bodyDef.position.x = 0;
        bodyDef.position.y = 11;
        bodyDef.userData = leftWall;
        bodyDef.type = b2Body.b2_staticBody;
        world.CreateBody(bodyDef).CreateFixture(leftWall);

        rightWall = new b2FixtureDef;
        rightWall.shape = new b2PolygonShape;
        rightWall.shape.SetAsBox(0.1, 13);

        bodyDef = new b2BodyDef;
        bodyDef.position.x = 20;
        bodyDef.position.y = 11;
        bodyDef.userData = rightWall;
        bodyDef.type = b2Body.b2_staticBody;
        world.CreateBody(bodyDef).CreateFixture(rightWall);
    }

    function defineWinnerPolys()
    {
        //creating triangle for win
        var my_verticesWinLeft = new Array();
        my_verticesWinLeft.push(new b2Vec2(-9.9, -1));
        my_verticesWinLeft.push(new b2Vec2(-0.7, 18.3));
        my_verticesWinLeft.push(new b2Vec2(-9.9, 18.3));

        var triangleWinLeft = new b2PolygonShape();
        triangleWinLeft.SetAsArray(my_verticesWinLeft, 3);

        var triWinLeft = new b2FixtureDef();
        triWinLeft.density=1.5;
        triWinLeft.friction=10;
        triWinLeft.restitution=0.3;
        triWinLeft.shape = triangleWinLeft;

        bodyDef = new b2BodyDef;
        bodyDef.userData = null;
        bodyDef.active = true;
        bodyDef.position.x = 10;
        bodyDef.position.y = 2;
        world.CreateBody(bodyDef).CreateFixture(triWinLeft);

        //triangle win right
        var my_verticesWinRight = new Array();
        my_verticesWinRight.push(new b2Vec2(9.9, -1));
        my_verticesWinRight.push(new b2Vec2(9.9, 18.3));
        my_verticesWinRight.push(new b2Vec2(0.35, 18.3));

        var triangleWinRight = new b2PolygonShape();
        triangleWinRight.SetAsArray(my_verticesWinRight, 3);

        var triWinRight = new b2FixtureDef();
        triWinRight.density=1.5;
        triWinRight.friction=10;
        triWinRight.restitution=0.3;
        triWinRight.shape = triangleWinRight;

        bodyDef = new b2BodyDef;
        bodyDef.userData = null;
        bodyDef.active = true;
        bodyDef.position.x = 10;
        bodyDef.position.y = 2;

        world.CreateBody(bodyDef).CreateFixture(triWinRight);
    }

    function defineNonWinnerPolys()
    {
        //creating triangle for non winner
        var my_verticesNonWin = new Array();
        my_verticesNonWin.push(new b2Vec2(0,-3));
        my_verticesNonWin.push(new b2Vec2(1.4,1));
        my_verticesNonWin.push(new b2Vec2(-1.4,1));

        var triangleSmallNonWin = new b2PolygonShape();
        triangleSmallNonWin.SetAsArray(my_verticesNonWin, 3);

        var triNonWin = new b2FixtureDef();
        triNonWin.density=1.5;
        triNonWin.friction=0.8;
        triNonWin.restitution=0.3;
        triNonWin.shape = triangleSmallNonWin;

        bodyDef = new b2BodyDef;
        bodyDef.userData = null;
        bodyDef.active = true;
        bodyDef.position.x = 9.8;
        bodyDef.position.y = 19.3;
        world.CreateBody(bodyDef).CreateFixture(triNonWin);
    }

    //Function listener for when ball hits bottom
    function setupBottomListener(e)
    {
        var contactListener = new Box2D.Dynamics.b2ContactListener;
        contactListener.PostSolve = function(contact, manifold)
        {
            var firstObject = contact.GetFixtureA().GetBody().GetUserData();
            var secondObject = contact.GetFixtureB().GetBody().GetUserData();
            if(firstObject == ground && secondObject == zombieHead)
            {
                if(!hitBottom)
                {
                    hitBottom = true;
                    bounceAudio.play();
                    bricksScheduledForRemoval[++index] = contact.GetFixtureB().GetBody();
                    setTimeout(openNewPage, 0);
                }
            }
        };
        world.SetContactListener(contactListener);
    }

    function openNewPage()
    {
        createBox();
    }

    function handleMouseDown(e)
    {
        isMouseDown = true;
        canvas.addEventListener("mousemove", handleMouseMove, true);
        canvas.addEventListener("touchmove", handleTouchMove, true);
    }

    function handleMouseUp(e)
    {
        isMouseDown = false;
        mouseX = undefined;
        mouseY = undefined;
    }

    function handleTouchMove(e)
    {
        var touchPos = stage.getTouchPosition();
        mouseX = (touchPos.x - getElementPosition(canvas).x) / 30;
        mouseY = (touchPos.y - getElementPosition(canvas).y) / 30;
    }

    function handleMouseMove(e)
    {
        if(e.clientY <= 200)
        {
            mouseX = (e.clientX - getElementPosition(canvas).x) / 30;
            mouseY = (e.clientY - getElementPosition(canvas).y) / 30;
        }
        else if(mouseJoint != null)
        {
            world.DestroyJoint(mouseJoint);
            mouseJoint = null;
            canvas.removeEventListener("mousemove", handleMouseMove, true);
            canvas.removeEventListener("mousedown", handleMouseDown, true);
            canvas.removeEventListener("touchstart", handleMouseDown, true);
        }
    }

    function getBodyAtMouse()
    {
        mousePVec = new b2Vec2(mouseX, mouseY);
        var aabb = new b2AABB();
        aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
        aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
        selectedBody = null;
        world.QueryAABB(getBodyCB, aabb);
        return selectedBody;
    }

    function getBodyCB(fixture)
    {
        if(fixture.GetBody().GetType() != b2Body.b2_staticBody)
        {
            if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec))
            {
                selectedBody = fixture.GetBody();
                return false;
            }
        }
        return true;
    }

    function getElementPosition(element)
    {
        var elem = element, tagname="", x = 0, y = 0;

        while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined"))
        {
            y += elem.offsetTop;
            x += elem.offsetLeft;
            tagname = elem.tagName.toUpperCase();

            if(tagname == "BODY")
                elem = 0;

            if(typeof(elem) == "object")
            {
                if(typeof(elem.offsetParent) == "object")
                {
                    elem = elem.offsetParent;
                }
            }
        }
        return {x: x, y: y};
    }



    //this is the tick or update where the drawing happens
    function update()
    {
        world.Step(1/60, 10, 20);
        world.DrawDebugData();
        ctx.drawImage(base_image, 0, 0);

        for(var b = world.m_bodyList; b != null; b = b.m_next)
        {
            ctx.save();
            ctx.translate(b.GetPosition().x*worldScale, b.GetPosition().y*worldScale);
            if(b.GetUserData() == spokeImage)
            {
                ctx.drawImage(spokeImage, -spokeImage.width/2, -spokeImage.height/2);
            }
            if(b.GetUserData() == zombieHead)
            {
                ctx.rotate(b.GetAngle());
                ctx.drawImage(zombieHead, -zombieHead.width/2, -zombieHead.height/2);
            }
            if(b.GetUserData() == cover)
            {
                ctx.drawImage(brick_image, -brick_image.width/2, -brick_image.height/2);
            }
            ctx.restore();
        }

        if(mouseY <= 3)
        {
            if(isMouseDown && (!mouseJoint))
            {
                var body = getBodyAtMouse();
                if(body)
                {
                    var md = new b2MouseJointDef();
                    md.bodyA = world.GetGroundBody();
                    md.bodyB = body;
                    md.target.Set(mouseX, mouseY);
                    md.collideConnected = true;
                    md.maxForce = 999;
                    mouseJoint = world.CreateJoint(md);
                    body.SetAwake(true);
                }
            }
        }



        if(mouseJoint)
        {
            if(isMouseDown)
            {
                mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
            }
            else
            {
                world.DestroyJoint(mouseJoint);
                mouseJoint = null;
            }
        }

        world.ClearForces();
        //ctx.clearRect(0, 0, 600, 800);
        requestAnimFrame(update);
    }

    //Returns true if this browser supports canvas
    function supportsCanvas() {
        return !!document.createElement('canvas').getContext;
    };

    //Handle page load
    $(function () {
        if (supportsCanvas()) {
            init();
            requestAnimFrame(update);
        } else {
            //Sorry user cann't view canvas
            $('#plinkoGame').hide();
        }
    });
});