export class Card {
  readonly value: any
  readonly color?: any
  readonly id: string

  constructor(value: any, color: any){
    this.value = value
    this.color = color
    if (color !== undefined) {
      this.id = value.toString() + color
    } else {
      this.id = value.toString()
    }
  }

  getId(){
    return this.id
  }

  getName(){
    let name = ''
    if(this.color !== undefined){
      name += this.color
    }
    name += this.value.toString()
    return name
  }
}
