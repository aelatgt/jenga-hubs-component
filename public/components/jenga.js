// https://incandescent-psychedelic-spark.glitch.me/components/jenga.js 
// http://aelatgt.link/JKHJVgF

/**
 * This function contains a little json parser to make creating shape templates easier.
 * See examples in some of the functions below to see how the json is formatted.
 * Right now, this function also sets some other basic attributes onto the create shape,
 * but this can be changed in the future.
*/
function addShapeTemplate(json, id) {
				
	//Query assets in order to setup template
	let assets = document.querySelector("a-assets");
	// create a new template variable
	let newTemplate = document.createElement("template");
	// create template id
  newTemplate.id = id;
  
	// create a new entity for the template so we can append it to the assets later
	// normally this is done in the Hubs.html "bootstrap" file
	let newEntity = document.createElement("a-entity");
				
	// setup the attributes for the template such and class and components that
	// should be associated with the template entities
				
	// set the class to interactable if you want interaction or some other class
	// based on hubs interaction layers
	newEntity.setAttribute("class", "interactable");
				
	// for attributes with multiple objects in the schema it's easier to setup
	// a varibable to hold the attribute and its values then create the node on
	// the entity
				
	// the body helper component allows you to setup dynamic attributes for physics
	// interactions.  the type can be dynamic or static.  collision filters and
	// masks are used to limit what objects can collide with.  See the body-helper
	// component for more information
	let bh = document.createAttribute("body-helper");
	bh.value = "type: dynamic; mass: 1; collisionFilterGroup: 1; collisionFilterMask: 15;";
	newEntity.setAttributeNode(bh);
				
	// An object needs to have geometry in order to be visible and work with physics
	// here we reuse the bh variable since the body helper node has been added to the entity.  In this case we are creating the geometry attribute (see aframe docs)
	/*
  bh = document.createAttribute("geometry");
	// create a sphere geometry with a radius of 0.5 meters
	//- bh.value = "primitive: sphere; radius: 0.5";
  bh.value = "primitive: cylinder; radius: 0.25; height: 2;";
	newEntity.setAttributeNode(bh);
  */
  for (var key in json) {
    var value = json[key];
    var childProperties = "";
    // childProperties = JSON.stringify(value);
    childProperties = (
      Object.entries(value).map(([k, v]) => `${k}:${v}`).join(';')
    );
    // may need to remove the parenthesis from the stringified json
    /*
    for (var subkey in value) {
      var subvalue = value[subkey];
      childProperties += subValue;
    }
    */
    // console.log(childProperties);
    var attribute = document.createAttribute(key);
    attribute.value = childProperties;
    newEntity.setAttributeNode(attribute);
  }
				
	// set the unowned body kinematic component for the object since it's networked
	// and physics related.
	newEntity.setAttribute("set-unowned-body-kinematic", "");
	// sets the remote hover target component on the object
	newEntity.setAttribute("is-remote-hover-target", "");
				
	// the tags component allows you to filter the collisions and interactable
	// qualities of the entity.  We can reuse bh to set all it's values
	bh = document.createAttribute("tags");
	// set it to be a hand collision target, holdable, give it a hand constraint, a remote constraint, and set to be inspectable with a right click.
	bh.value = "isHandCollisionTarget: true; isHoldable: true; offersHandConstraint: true; offersRemoteConstraint: true; inspectable: true;";
	newEntity.setAttributeNode(bh);
				
	// you can set the objects to be destroyed at extreme distances in order to avoid having a bunch of hard to find physics objects falling in your hub
	//- newEntity.setAttribute("destroy-at-extreme-distances", "");
	// sets whether the object can be scaled when you grab it. Check hubs docs or the component to see how it can be scaled in different modes
	newEntity.setAttribute("scalable-when-grabbed", "");
				// another component setup.  Check it out in the components in src
	newEntity.setAttribute("set-xyz-order", "");
	// important! since the matrix auto update on objects in turned off by default
	// in order to save compute power
	newEntity.setAttribute("matrix-auto-update", "");
	// whether this object has a hoverable visuals interaction. You may have to add additional child entities to the template to get this to show up.  Check the component to see how it works 
	newEntity.setAttribute("hoverable-visuals", "");

	// Important!  This Component helps you set the collision shape for the object
	// without it set on the actual entity which contains the mesh (set with the 
	// geometry component above in this case) the physics won't collide and the 
	// object will fall through the ground.  Check the component for details
	bh = document.createAttribute("shape-helper");
	bh.value = "";
	newEntity.setAttributeNode(bh);
				
	//add the listed-media component
	newEntity.setAttribute("listed-media", "");
	
	//add the camera-cube-env component
	newEntity.setAttribute("camera-cube-env", "");
				
	//Once all the attributes are setup on the entity you can append it to the template variable content created above.
	newTemplate.content.appendChild(newEntity);
				
	// once the template is created you append it to the assets
	assets.appendChild(newTemplate);
				
				
	//	This sets up an update function for how often each networked entity needs to update
	// position, rotation, or scale based on each transforms setting in the NAF schema.
	// I'm not sure why it's not a utility function in NAF?
	const vectorRequiresUpdate = epsilon => {
		return () => {
			let prev = null;

			return curr => {
        // temp
        // return false;
        
        
				if (prev === null) {
					prev = new THREE.Vector3(curr.x, curr.y, curr.z);
					return true;
				} else if (!NAF.utils.almostEqualVec3(prev, curr, epsilon)) {
					prev.copy(curr);
					return true;
				}

				return false;
			};
		};
	};

	// Add the new schema to NAF. and declare the networked components and their update 
	// sensitivity using the function above if they modify the transforms.
	NAF.schemas.add({
		template: "#" + id,
		components: [
			{
				component: "position",
				requiresNetworkUpdate: vectorRequiresUpdate(0.001)
			},
			{
				component: "rotation",
				requiresNetworkUpdate: vectorRequiresUpdate(0.5)
			},
			{
				component: "scale",
				requiresNetworkUpdate: vectorRequiresUpdate(0.001)
			},
			"media-loader",
			"material",
			"pinnable"
		],
	});
}

window.mod_addShapeFromTemplate = function(id) {  
  var el = document.createElement("a-entity");
  el.setAttribute("networked", { 
    template: "#" + id 
  });
  
  
  /*
  // networkId: 'button',
  // owner: 'scene',
  entity.setAttribute('networked', {
    template: '#color-media',
    networkId: 'button',
    owner: 'scene',
  })
  */
  
  el.object3D.position.y = 2;
  AFRAME.scenes[0].appendChild(el);

  return el;
};

window.mod_addShape = function(json, id) {
	addShapeTemplate(json, id);
  var el = mod_addShapeFromTemplate(id);
  
  /*
  var el = document.createElement("a-entity");
  el.setAttribute("networked", { 
    template: "#" + id 
  });
  
  el.object3D.position.y = 2;
  AFRAME.scenes[0].appendChild(el);
  */

  return el;
};

/**
 * This function adds some nice lighting to the scene.
 * Right now, the light object it creates also has physics attached to it.
 * This should likely be changed in the future.
 */
window.mod_addLighting = function() {
  var json = {
    "light": {
      "type": "hemisphere",
      "groundColor": "#CCC",
      "color": "#285ED9",
      "intensity": 1,
    },
    "geometry": {
      "primitive": "box",
      "width": 0.5,
      "height": 0.5,
      "depth": 1.5,
    },
  };
	var id = "light-media";

  var shape = mod_addShape(json, id);
  shape.object3D.position.x = 50;
  shape.object3D.position.y = 30;
  shape.object3D.position.z = 50;
  
	return shape;
};

/**
 * This function creates some blocks to help visualize the 3D axis of the world.
 * This function is for debugging purposes only.
 */
window.mod_addAxis = function() {
  var xJson = {
    "geometry": {
      "primitive": "box",
      "width": 0.5,
      "height": 0.5,
      "depth": 1.5,
    },
    "material": {
      "color": "red",
      "metalness": 0.5,
      "roughness": .8,
    },
  };

  var xShape = mod_addShape(xJson, "x-axis");
  xShape.object3D.position.x = 20;


  var zJson = {
    "geometry": {
      "primitive": "box",
      "width": 0.5,
      "height": 0.5,
      "depth": 1.5,
    },
    "material": {
      "color": "green",
      "metalness": 0.5,
      "roughness": .8,
    },
  };
  
  // note that the y-axis is just up and down

  var zShape = mod_addShape(zJson, "z-axis");
  zShape.object3D.position.z = 20;
};

/**
 * This function creates the templates for the jenga blocks.
 */
window.mod_addJengaBrickTemplate = function() {
  // single-action-button="event: click"
  // randomize-networked-color="event: click"
  var id = "jenga-brick";
  var json = {
    "geometry": {
      "primitive": "box",
      "width": 2.5 / 3.0,
      "height": 1.5 / 3.0,
      "depth": 7.5 / 3.0,
    },
    "material": {
      "color": "#DEB887",
      "metalness": 0.0,
      "roughness": 1.0,
      "emissiveIntensity": 0.25
    },
    "single-action-button": {
      "event": "click"
    },
    "randomize-networked-color": {
      "event": "click"
    }
  };
  // making all of the bricks have this tag causes a bunch of weird behaviors over the network
	// var id = "interactable-box-media";

  addShapeTemplate(json, id);
};

/**
 * This function uses the existing jenga block template to create a new jenga block.
 * Requires the jenga block to already be created.
 * The brick id corresponds to the order in which the jenga block was created.
 */
window.mod_addJengaBrickFromTemplate = function(brickId) {
  var id = "jenga-brick";
  var shape = mod_addShapeFromTemplate(id);
  
  shape.setAttribute("networked", { 
    template: "#" + id,
    networkId: "" + id + "-" + brickId,
    // owner: 'scene'
  });
  
	return shape;
};

var jengaBlocks = [];

/**
 * Creates the templates required to make a Jenga tower as well as other setup steps.
 */
window.mod_setupJengaTower = function() {
  mod_addJengaBrickTemplate();
};
mod_setupJengaTower();

/**
 * Creates a Jenga tower at the origin specified in the function.
 * This function currently requires a global array containing all the created jenga blocks
 * The first time this function is run, it populates the global array with jenga blocks
 * After the tower has already been initialized, it sets the position of the corresponding jenga block.
 * In the future, whether or not the jenga tower has been initialized likely needs to be networked,
 * otherwise multiple towers may be able to created in the same location at once
*/
window.mod_addJengaTower = function() { // NAF
  // initialized = false;
  // mod_removeJengaTower();
  var newJengaBlocks = [];
  var initialized = jengaBlocks.length > 0;
  var levels = 18;
  var rows = 3;
  var brickWidth = 2.5 / 3.0;
  var brickHeight = 1.5 / 3.0;
  var brickDepth = 7.5 / 3.0;
  var margin = {x: 0.001, y: 0.001};
  var origin = {x: 0, y: 0, z: 0};

  var marginedBrickWidth = brickWidth + margin.x;
  var marginedBrickHeight = brickHeight + margin.y;
  origin.y += marginedBrickHeight;
  
  var index = 0;
  for (var level = 0; level < levels; level++) {
    for (var row = 0; row < rows; row++) {
      var shape;
      if (!initialized) {
        // create a brick from the template for the first time
        shape = mod_addJengaBrickFromTemplate(index);
        
        /*
        if (shape != null && NAF.connection.isConnected()) {
          NAF.utils.takeOwnership(shape);
        }
        */
      } else {
        // get the shape from the list of shapes
        // shape = jengaBlocks[index];
        // or get the shape from the dom (this may work better for networking)
        shape = document.querySelector("#naf-jenga-brick-" + index);
        // console.log("index = " + index + ", y = " + shape.object3D.position.y);
        
        if (shape != null && NAF.connection.isConnected()) {
          // NAF.utils.takeOwnership(shape);
          // set physics object to kinematic so we can directly modify the position of the game objcets
          shape.setAttribute('body-helper', { "type": "kinematic" });
        }
      }
      
      // here is the actual code for determing the position and orientation of the current jenga block
      var x = marginedBrickWidth * row;
      var y = level * marginedBrickHeight;
      var z = 0;
      var rotation = 0;
      if (level % 2 == 1) {
        // if this is an odd level
        var temp = x;
        x = z;
        z = temp - marginedBrickWidth;
        // rotate each brick 90 degrees
        rotation = Math.PI / 2.0;
      } else {
        x = x - marginedBrickWidth;
      }
      x += origin.x;
      y += origin.y;
      z += origin.z;
      
      // try setting position through the dom instead
      // or taking ownership of the object first
      // or updating by specifying matrixNeedsUpdate
      shape.object3D.position.x = x;
      shape.object3D.position.y = y;
      shape.object3D.position.z = z;
    
      shape.setAttribute("position", { "x": x, "y": y, "z": z });
      // shape.object3D.position.set(x, y, z);
      shape.object3D.rotation.x = 0;
      shape.object3D.rotation.y = rotation;
      shape.object3D.rotation.z = 0;
            
      // shape.object3D.matrixNeedsUpdate = true;
      // shape.object3D.updateMatrices();

      if (!initialized) {
        jengaBlocks.push(shape);
      } else {
        // we can't unfreeze the jenga tower immediately otherwise the jenga blocks positions won't update
        // this part needs to fixed soon because it is very prone to error and race conditions
        setTimeout(mod_unfreezeJengaTower, 100);
        // shape.setAttribute('body-helper', { "type": "dynamic" });
      }
      index++;
    }
  }
  
  // jengaBlocks = newJengaBlocks;
  return jengaBlocks;
};

window.mod_unfreezeJengaTower = function(physicsState) {
  mod_setJengaTowerPhysicsState("dynamic");
};

window.mod_freezeJengaTower = function(physicsState) {
  mod_setJengaTowerPhysicsState("kinematic");
};

window.mod_setJengaTowerPhysicsState = function(physicsState) {
  for (var block of jengaBlocks) {
    if (block != null) {
      block.setAttribute('body-helper', { "type": physicsState });
    }
  }
};

window.mod_removeJengaTower = function() {
  for (var block of jengaBlocks) {
    if (block != null && block.parentNode != null) {
      block.parentNode.removeChild(block);
    }
  }
  jengaBlocks = [];
};