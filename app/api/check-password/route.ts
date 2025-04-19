import { NextResponse } from "next/server"
import crypto from "crypto"

// HaveIBeenPwned API endpoint
const HIBP_API_URL = "https://api.pwnedpasswords.com/range"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    // Hash the password using SHA-1 (as required by HIBP)
    const sha1Password = crypto.createHash("sha1").update(password).digest("hex").toUpperCase()

    // Get the first 5 characters of the hash (prefix)
    const prefix = sha1Password.substring(0, 5)

    // Get the remaining characters (suffix)
    const suffix = sha1Password.substring(5)

    // Call the HIBP API with the prefix
    const response = await fetch(`${HIBP_API_URL}/${prefix}`)

    if (!response.ok) {
      throw new Error(`HIBP API error: ${response.status} ${response.statusText}`)
    }

    // Get the response text (list of hash suffixes and counts)
    const data = await response.text()

    // Split the response into lines
    const lines = data.split("\n")

    // Check if our suffix is in the response
    for (const line of lines) {
      const [hashSuffix, count] = line.split(":")

      if (hashSuffix.trim() === suffix) {
        // Password has been pwned
        return NextResponse.json({
          isPwned: true,
          count: Number.parseInt(count.trim(), 10),
          message: "This password has been found in a data breach.",
        })
      }
    }

    // Password has not been pwned
    return NextResponse.json({
      isPwned: false,
      message: "Password not found in any known data breaches.",
    })
  } catch (error) {
    console.error("Error checking password:", error)
    return NextResponse.json({ error: "Failed to check password security" }, { status: 500 })
  }
}
