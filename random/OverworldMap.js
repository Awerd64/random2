class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = {}; // Live objects are in here
    this.configObjects = config.configObjects; // Configuration content

    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    if (this.walls[`${x},${y}`]) {
      return true;
    }
    //Check for game objects at this position
    return Object.values(this.gameObjects).find(obj => {
      if (obj.x === x && obj.y === y) { return true; }
      if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y ) {
        return true;
      }
      return false;
    })

  }

  mountObjects() {
    Object.keys(this.configObjects).forEach(key => {

      let object = this.configObjects[key];
      object.id = key;

      let instance;
      if (object.type === "Person") {
        instance = new Person(object);
      }
      this.gameObjects[key] = instance;
      this.gameObjects[key].id = key;
      instance.mount(this);
    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    //Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      this.startCutscene(match.talking[0].events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene( match[0].events )
    }
  }

  

}

window.OverworldMaps = {
  HugeHallway: {
    lowerSrc: "maps/HugeHallway.png",
    upperSrc: "maps/CreationUpperRoom.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(15),
        y: utils.withGrid(1),
        src: "people/npc7.png"
      },
      npc: {
        type: "Person",
        x: utils.withGrid(15),
        y: utils.withGrid(3),
        src: "people/npc8.png",
        behaviorLoop: [
          {type: "walk", direction: "left"},
          {type: "stand", direction: "up", time: 60},
          {type: "walk", direction: "up"},
          {type: "walk", direction: "right"},
          {type: "walk", direction: "down"},
        ], 
        talking: [
          {
            events: [
              { type: "textMessage", text: "TFQ", faceHero: "npc"},
            ]
          }
        ] 
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(15,0)]: [
          {
            events: [
               {type: "changeMap", map: "Creation"}
            ]
          }
        ]
    }
  },
  Creation: {
    lowerSrc: "maps/Creati.png",
    upperSrc: "maps/CreationUpperRoom.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
        src: "people/npc7.png"
      }, npc: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "people/npc8.png",
          behaviorLoop: [
            {type: "walk", direction: "left"},
            {type: "stand", direction: "up", time: 600},
            {type: "walk", direction: "up"},
            {type: "walk", direction: "right"},
            {type: "walk", direction: "down"},
          ], 
        talking: [
          {
            events: [
              { type: "textMessage", text: "helllo..", faceHero: "npc"},
              { type: "textMessage", text: "how are you ?"},
              { type: "textMessage", text: "fine"},
            ]
          }
        ] 
      }, 
      npc2: {
        type: "Person",
        x: utils.withGrid(4), 
        y: utils.withGrid(9), 
        src: "people/second.png",
        behaviorLoop: [
         {type: "stand", direction: "up", time: 1200},
         {type: "stand", direction: "down", time: 900},
         {type: "stand", direction: "left", time: 300},
         {type: "stand", direction: "right", time: 500},
        ],
        talking: [
          {
            events: [
           {type: "textMessage", text: "yé veux du poulet yé vien d'arrivé en france", faceHero: "npc2"},
             
            ]
          }
        ] 
      },
      head: {  
        type: "Person",
        x: utils.withGrid(1),
        y: utils.withGrid(9),
        src: "elements/head.png",
        talking: [
          {
            events: [
              {type: "textMessage", text: "Cette chose n'est qu'une cage avec une tête de chat putride à l'intérieur",},
            ]
          }
        ]
      },
      machine: {
        type: "Person",
        x: utils.withGrid(10),
        y: utils.withGrid(4),
        src: "elements/machine.png",
        talking: [
          {
            events: [
              {type: "textMessage", text: "that is merely a sorta machine",},
            ]
          }
        ]
       } 
    },
    walls: {
      [utils.asGridCoord(5,3)]: true,
      [utils.asGridCoord(5,6)]: true,
      [utils.asGridCoord(6,3)]: true,
      [utils.asGridCoord(6,6)]: true,
      [utils.asGridCoord(8,8)]: true,
      [utils.asGridCoord(8,6)]: true,
      [utils.asGridCoord(9,6)]: true,
      [utils.asGridCoord(9,8)]: true,
    
      
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,10)]: [
          {
            events: [
               {type: "changeMap", map: "HugeHallway",}
            ]
          }
        ]
    }
},

} 

