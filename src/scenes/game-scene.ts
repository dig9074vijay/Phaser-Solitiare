import * as Phaser from 'phaser';
import { ASSET_KEYS, SCENE_KEYS } from './common';

const DEBUG = false;
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
  }

  #createDrawPile(): void {
    this.#drawCardLocationBox(DRAW_PILE_X_POSITION,DRAW_PILE_Y_POSITION);
    this.#drawPileCards = [];
    for(let i = 0; i < 3; i++) {
      this.#drawPileCards.push(this.#createCard(DRAW_PILE_X_POSITION + i*5,DRAW_PILE_Y_POSITION));
    }
  }

  #drawCardLocationBox(x: number, y: number): void {
    this.add.rectangle(x,y,56,78).setOrigin(0).setStrokeStyle(2,0x000000,0.5); 
  }

  #createCard(x:number,y:number): Phaser.GameObjects.Image {
    return this.add.image(x,y,ASSET_KEYS.CARDS,CARD_BACK_FRAME).setOrigin(0).setScale(SCALE);
  }

  #createDiscardPile():void{
    this.#drawCardLocationBox(DISCARD_PILE_X_POSITION,DISCARD_PILE_Y_POSITION);
    this.#discardPileCards = [];
    const bottomCard = this.#createCard(DISCARD_PILE_X_POSITION,DISCARD_PILE_Y_POSITION).setVisible(false);
    const topCard = this.#createCard(DISCARD_PILE_X_POSITION,DISCARD_PILE_Y_POSITION).setVisible(false);
    this.#discardPileCards.push(bottomCard,topCard);
  }

  #createFoundationPile():void{
    this.#foundationPileCards = [];
    FOUNDATION_PILE_X_POSITIONS.forEach((x)=>{
      this.#drawCardLocationBox(x,FOUNDATION_PILE_Y_POSITION);
      const card = this.#createCard(x,FOUNDATION_PILE_Y_POSITION).setVisible(false);
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
      const cardGameobject = this.#createCard(0,j*20);
      tableauContainer.add(cardGameobject);
      }
    } 
  }
 
}``
