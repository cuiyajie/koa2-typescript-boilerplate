export class CustomError extends Error {
  constructor(status: number, errorMessage: string) {
    super(errorMessage)
    this.status = status
    this.message = errorMessage
  }
  
  status: number
  message: string
  
  toJSON() {
    return { status: this.status, message: this.message }
  }
}