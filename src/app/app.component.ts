import {Component, OnInit} from '@angular/core';
import {fromEvent} from "rxjs";


enum DIRECTION {
  NORTH,
  EAST,
  SOUTH,
  WEST,
}
enum ACTION {
  MOVE,
  PLACE,
  LEFT,
  RIGHT,
  REPORT
}
interface RobotState {
  x: number;
  y: number;
  direction: DIRECTION
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'MarsRobotSimulator';
  dimension = [0, 1, 2, 3, 4];
  DIRECTION = DIRECTION;
  dirClass = {
    [DIRECTION.NORTH]: 'north',
    [DIRECTION.EAST]: 'east',
    [DIRECTION.SOUTH]: 'south',
    [DIRECTION.WEST]: 'west',
  }
  state: RobotState;
  placeObject: RobotState;
  commandsStack: {action: ACTION, payload: RobotState|undefined}[] = [];
  constructor() {
    this.state = {
      x: 0,
      y: this.dimension.length - 1,
      direction: DIRECTION.NORTH
    };
    this.placeObject = {...this.state};
  }
  ngOnInit() {

    fromEvent<KeyboardEvent>(document, 'keydown')
      .subscribe(e => {
        const {key} = e;
        const {dispatch} = this;
        console.log('from keyboard:', key);
        if (key === 'ArrowLeft') {
          dispatch(ACTION.LEFT);
        } else if (key === 'ArrowRight') {
          dispatch(ACTION.RIGHT);
        } else if (key === ' ') {
          dispatch(ACTION.MOVE);
        } else if (key.toLowerCase() === 'r') {
          dispatch(ACTION.REPORT);
        }
      });

  }
  private dispatch = (action: ACTION, payload?: RobotState) => {
    if (!this.commandsStack.length && action !== ACTION.PLACE) return;
    this.commandsStack.push({action, payload});
    let {x, y, direction} = this.state;
    console.log('\tcommand:', action);
    if (action === ACTION.MOVE) {
      const move = this.getNextMove();
      x += move.x;
      y += move.y;
    } else if (action === ACTION.RIGHT) {
      direction = (direction + 1) % 4;
    } else if (action === ACTION.LEFT) {
      direction = (direction + 3) % 4;
    } else if (action === ACTION.PLACE && payload) {
      x = payload.x;
      y = payload.y;
      direction = payload.direction;
    } else if (action === ACTION.REPORT) {
      alert(`X: ${x}, Y: ${y}, toward ${this.dirClass[direction].toUpperCase()}`);
    }
    console.log('\tcalculated state:', {x, y, direction});
    if (x < 0 || y < 0 || x >= this.dimension.length || y >= this.dimension.length)
      return;
    this.state = {y, x, direction};
  };

  private getNextMove () {
    if (this.state.direction === DIRECTION.NORTH) return {x: 0, y: -1};
    if (this.state.direction === DIRECTION.SOUTH) return {x: 0, y: 1};
    if (this.state.direction === DIRECTION.WEST) return {x: -1, y: 0};
    if (this.state.direction === DIRECTION.EAST) return {x: 1, y: 0};
    return {x: 0, y: 0};
  }
  updatePlace(event: any, key: 'x'|'y'|'direction', ) {
    this.placeObject[key] = parseInt(event.target.value, 10);
  }
  handlePlace(placeBtn: HTMLButtonElement) {
    placeBtn.blur();
    console.log('handle place');
    this.dispatch(ACTION.PLACE, this.placeObject);
  }
}
