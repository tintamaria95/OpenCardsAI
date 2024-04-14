export class Card {
  readonly id: string
  readonly value: number | string
  readonly color?: string
  

  constructor(value: number | string, color?: string, id?: string){
    this.value = value
    this.color = color

    if (id !== undefined){
      this.id = id
    } else {
      if (color !== undefined) {
        this.id = value.toString() + color
      } else {
        this.id = value.toString()
      }
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
