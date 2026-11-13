import Foundation

public enum OrderStatus: String, Codable {
  case placed = "placed"
  case approved = "approved"
  case delivered = "delivered"
}
