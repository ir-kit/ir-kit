import Foundation

public enum FindPetsByStatusParamStatus: String, Codable {
  case available = "available"
  case pending = "pending"
  case sold = "sold"
}
