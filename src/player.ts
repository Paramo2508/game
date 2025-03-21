import {
  Graphics,
  Rectangle,
} from 'pixi.js';
import { Food, FOOD_RADIUS } from './food';
import { Bot } from './bot'


// El servidor nos va a dar una posición relativa al mapa. (200, 300)
// Esto lo convertiremos a (0, 0).

export class Player extends Graphics {
  private velocityMagnitude = 10;
  public baseRadius;
  public radius: number;
  private color: number;
  public pos: {
    x: number,
    y: number,
  };
  private worldBounds: WorldBounds;

  constructor(worldBounds: WorldBounds, x: number, y: number, radius: number, color: number) {
    super();
    this.worldBounds = worldBounds;
    this.baseRadius = radius;
    this.radius = radius;
    this.color = color;
    this.pos = { x, y };
    this.draw();
  }

  private draw() {
    this.clear();
    this.circle(this.pos.x, this.pos.y, this.radius);
    this.fill(this.color);
    this.stroke({
      width: 3,
      color: 0x0,
    })
  }

  public eatPlayer(playerEaten: Player) {
    this.radius = Math.sqrt(this.radius * this.radius + playerEaten.radius * playerEaten.radius);
    playerEaten.destroy();
    this.draw();
  }

  public eatFood(foodEaten: Food) {
    // increase surface not radius
    this.radius = Math.sqrt(this.radius * this.radius + FOOD_RADIUS * FOOD_RADIUS) * 1.002;
    foodEaten.destroy();
    this.draw();
  }

  public canEatFood(food: Food) {
    if (food.destroyed) return false;

    const playerCenterX = this.pos.x;
    const playerCenterY = this.pos.y;
    const foodCenterX = food.pos.x;
    const foodCenterY = food.pos.y;

    const dx = foodCenterX - playerCenterX;
    const dy = foodCenterY - playerCenterY;

    // Compare squared distances
    const distanceSquared = dx * dx + dy * dy;
    const radiusSquared = this.radius * this.radius;

    return distanceSquared <= radiusSquared;
  }

  public eatBot(botEaten: Bot){
    // increase surface not radius
    this.radius = Math.sqrt(this.radius * this.radius + botEaten.radius * botEaten.radius) * 1.002;
    botEaten.destroy();
    this.draw();
  }

  public canEatBot(bot: Bot){
    if (bot.destroyed) return false;

    const playerCenterX = this.pos.x;
    const playerCenterY = this.pos.y;
    const foodCenterX = bot.pos.x;
    const foodCenterY = bot.pos.y;

    const dx = foodCenterX - playerCenterX;
    const dy = foodCenterY - playerCenterY;

    // Compare squared distances
    const distanceSquared = dx * dx + dy * dy;
    const radiusSquared = this.radius * this.radius;

    return distanceSquared <= radiusSquared;
  }

  // TODO: optimize me
  private calculateMaxDistance(screen: Rectangle): number {
    return Math.sqrt(
      (screen.width / 2) * (screen.width / 2) +
      (screen.height / 2) * (screen.height / 2)
    );
  }

  public moveTowards(screen: Rectangle, x: number, y: number) {
    const dx = x - screen.width / 2;
    const dy = y - screen.height / 2;
    const delta = Math.sqrt(dx * dx + dy * dy);

    const maxDistance = this.calculateMaxDistance(screen);
    const normalizedDistance = Math.min((delta / maxDistance) * 2, 1);
    const velocity = (normalizedDistance * this.velocityMagnitude) / Math.sqrt(this.radius / 20);

    // Don't move if the distance is minimal
    if (delta > 3) {
      this.pos.x += (dx / delta) * velocity;
      this.pos.y += (dy / delta) * velocity;

      // Bound checking
      this.pos.x = Math.max(0, Math.min(this.pos.x, this.worldBounds.width))
      this.pos.y = Math.max(0, Math.min(this.pos.y, this.worldBounds.height))

      console.log(this.pos.x, this.pos.y)

      this.draw();
    }
  }
}
