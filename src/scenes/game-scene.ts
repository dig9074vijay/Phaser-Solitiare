import * as Phaser from 'phaser';
import { ASSET_KEYS, CARD_HEIGHT, CARD_WIDTH, SCENE_KEYS } from './common';

const DEBUG = true;
const SCALE = 1.5;
const CARD_BACK_FRAME = 52;
const SUIT_FRAMES = {
  CLUB: 0,
  DIAMOND: 13,
  HEART: 26,
  SPADE: 39,
}

const FOUNDATION_PILE_X_POSITIONS = [360,425,490,555];
const FOUNDATION_PILE_Y_POSITION = 5;
const DISCARD_PILE_X_POSITION = 85;
const DISCARD_PILE_Y_POSITION = 5;
const DRAW_PILE_X_POSITION = 5;
const DRAW_PILE_Y_POSITION = 5;
const TABLEAU_PILE_X_POSITION = 40;
const TABLEAU_PILE_Y_POSITION = 92;


export class GameScene extends Phaser.Scene {

  #drawPileCards!: Phaser.GameObjects.Image[];
  #discardPileCards!: Phaser.GameObjects.Image[];
  #foundationPileCards!: Phaser.GameObjects.Image[];
  #tableauContainers!: Phaser.GameObjects.Container[];

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  public create(): void {
    this.#createDrawPile();
    this.#createDiscardPile();
    this.#createFoundationPile();
    this.#createTableauPiles();
    this.#createDragEvents();
  }

  #createDrawPile(): void {
    this.#drawCardLocationBox(DRAW_PILE_X_POSITION,DRAW_PILE_Y_POSITION);
    this.#drawPileCards = [];
    for(let i = 0; i < 3; i++) {
      this.#drawPileCards.push(this.#createCard(DRAW_PILE_X_POSITION + i*5,DRAW_PILE_Y_POSITION,false));
    }

    const zone = this.add.zone(0,0,CARD_WIDTH*SCALE +20, CARD_HEIGHT*SCALE + 12).setOrigin(0).setInteractive();
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      console.log('draw pile clicked');
      this.#discardPileCards[0].setFrame(this.#drawPileCards[1].frame).setVisible(this.#discardPileCards[1].visible);
      this.#discardPileCards[1].setFrame(CARD_BACK_FRAME).setVisible(true);
    });


    if(DEBUG)
    {
      this.add.rectangle(zone.x,zone.y,zone.width,zone.height,0xff0000).setOrigin(0).setAlpha(0.5).set;
    }
  }

  #drawCardLocationBox(x: number, y: number): void {
    this.add.rectangle(x,y,56,78).setOrigin(0).setStrokeStyle(2,0x000000,0.5); 
  }

  #createCard(x:number,y:number,draggable:boolean,cardIndex?:number, pileIndex?:number): Phaser.GameObjects.Image {
    return this.add.image(x,y,ASSET_KEYS.CARDS,CARD_BACK_FRAME).setOrigin(0).setScale(SCALE).setInteractive({
      draggable: draggable
    }).setData({x,y,cardIndex,pileIndex});
  }

  #createDiscardPile():void{
    this.#drawCardLocationBox(DISCARD_PILE_X_POSITION,DISCARD_PILE_Y_POSITION);
    this.#discardPileCards = [];
    const bottomCard = this.#createCard(DISCARD_PILE_X_POSITION,DISCARD_PILE_Y_POSITION,true).setVisible(false);
    const topCard = this.#createCard(DISCARD_PILE_X_POSITION,DISCARD_PILE_Y_POSITION,true).setVisible(false);
    this.#discardPileCards.push(bottomCard,topCard);
  }

  #createFoundationPile():void{
    this.#foundationPileCards = [];
    FOUNDATION_PILE_X_POSITIONS.forEach((x)=>{
      this.#drawCardLocationBox(x,FOUNDATION_PILE_Y_POSITION);
      const card = this.#createCard(x,FOUNDATION_PILE_Y_POSITION,false).setVisible(false);
      this.#foundationPileCards.push(card);
    })
  }

  #createTableauPiles():void{
    this.#tableauContainers = [];
    for(let i = 0;i<7;i++)
    {
      const x = TABLEAU_PILE_X_POSITION + i*85;
      const tableauContainer = this.add.container(x , TABLEAU_PILE_Y_POSITION,[]);
      this.#tableauContainers.push(tableauContainer);
      for(let j = 0; j <= i; j++){
      const cardGameobject = this.#createCard(0,j*20,true,j,i);
      tableauContainer.add(cardGameobject);
      }
    } 
  }

  #createDragEvents():void{
    this.#createDragStartEventListener();
    this.#createDragEventListener();
    this.#createDragEndEventListener();
  }

  #createDragStartEventListener():void
  {
    this.input.on(Phaser.Input.Events.DRAG_START, (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
      console.log(gameObject.x,gameObject.y);
      gameObject.setData({x:gameObject.x,y:gameObject.y});
      const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
      if(tableauPileIndex !== undefined)
      {
     this.#tableauContainers[tableauPileIndex].setDepth(2);
      }
      else
      {
        gameObject.setDepth(2);
      }
      
      gameObject.setAlpha(0.8);
    });
  }

  #createDragEventListener():void
  {
    this.input.on(Phaser.Input.Events.DRAG, (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX:number, dragY:number) => {
      gameObject.setPosition(dragX,dragY);
      const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
      const cardIndex = gameObject.getData('cardIndex') as number;
      if(tableauPileIndex !== undefined)
      {
        const numberOfCardsToMove = this.#getNumberOfCardsTomoveAsPartOfStack(tableauPileIndex,cardIndex);
        for(let  i = 1; i<=numberOfCardsToMove;i++)
        {
          const card = this.#tableauContainers[tableauPileIndex].getAt(cardIndex + i) as Phaser.GameObjects.Image;
          card.setPosition(dragX,dragY + i*20);
        }
      }
      });
  }

  #createDragEndEventListener():void
  {
    this.input.on(Phaser.Input.Events.DRAG_END, (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
      const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
       
      if(tableauPileIndex !== undefined)
        {
       this.#tableauContainers[tableauPileIndex].setDepth(0);
        }
        else
        {
          gameObject.setDepth(0);
        }
      gameObject.setAlpha(1);
      gameObject.setPosition(gameObject.getData('x'),gameObject.getData('y'));
   
      const cardIndex = gameObject.getData('cardIndex') as number;
      if(tableauPileIndex !== undefined)
      {
        const numberOfCardsToMove = this.#getNumberOfCardsTomoveAsPartOfStack(tableauPileIndex,cardIndex);
        for(let  i = 1; i<=numberOfCardsToMove;i++)
        {
          const card = this.#tableauContainers[tableauPileIndex].getAt(cardIndex + i) as Phaser.GameObjects.Image;
          card;
          card.setPosition(card.getData('x'),card.getData('y'));
        }
      }
    });
  }

  #getNumberOfCardsTomoveAsPartOfStack(tableauPileIndex:number,cardIndex:number):number
  {
    if(tableauPileIndex !== undefined)
    {
      const lastCardIndex = this.#tableauContainers[tableauPileIndex].length - 1;
      return lastCardIndex - cardIndex;
    }
    return 0;
  }


 
}
