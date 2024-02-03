import { createContext } from "react"
import Matrix from "../classes/Matrix"

class DataContextClass {
  matrix: Matrix = new Matrix()

  constructor(){}

}

const DataContext = createContext(new DataContextClass())

export default DataContext