// This script generates dummy users and posts for testing purposes

// Function to check if dummy data is already loaded
function isDummyDataLoaded() {
  const dummyDataLoaded = localStorage.getItem("dummyDataLoaded")
  return dummyDataLoaded === "true"
}

// Function to generate random users
function generateDummyUsers() {
  // Only load dummy data once
  if (isDummyDataLoaded()) {
    console.log("Dummy data already loaded")
    return
  }

  console.log("Generating dummy users...")

  // First names
  const firstNames = [
    "James",
    "John",
    "Robert",
    "Michael",
    "William",
    "David",
    "Richard",
    "Joseph",
    "Thomas",
    "Charles",
    "Mary",
    "Patricia",
    "Jennifer",
    "Linda",
    "Elizabeth",
    "Barbara",
    "Susan",
    "Jessica",
    "Sarah",
    "Karen",
  ]

  // Last names
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Jones",
    "Brown",
    "Davis",
    "Miller",
    "Wilson",
    "Moore",
    "Taylor",
    "Anderson",
    "Thomas",
    "Jackson",
    "White",
    "Harris",
    "Martin",
    "Thompson",
    "Garcia",
    "Martinez",
    "Robinson",
  ]

  // Bio templates
  const bioTemplates = [
    "Software developer passionate about {interest}",
    "Digital nomad exploring the world while working on {interest}",
    "Photographer and {interest} enthusiast",
    "Student studying {interest} at University",
    "Professional {interest} coach and mentor",
    "Writer and blogger focused on {interest}",
    "Entrepreneur building a startup in the {interest} space",
    "Fitness enthusiast and {interest} lover",
    "Artist specializing in {interest} and digital media",
    "Teacher with a passion for {interest}",
  ]

  // Interests
  const interests = [
    "web development",
    "artificial intelligence",
    "photography",
    "travel",
    "fitness",
    "cooking",
    "music",
    "gaming",
    "reading",
    "hiking",
    "painting",
    "yoga",
    "fashion",
    "blockchain",
    "sustainability",
    "psychology",
    "history",
    "astronomy",
    "filmmaking",
    "dancing",
  ]

  // Locations
  const locations = [
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Houston, TX",
    "Phoenix, AZ",
    "Philadelphia, PA",
    "San Antonio, TX",
    "San Diego, CA",
    "Dallas, TX",
    "San Jose, CA",
    "London, UK",
    "Toronto, Canada",
    "Sydney, Australia",
    "Berlin, Germany",
    "Paris, France",
  ]

  // Avatar colors
  const avatarColors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F333FF",
    "#FF33F3",
    "#33FFF3",
    "#F3FF33",
    "#FF3333",
    "#33FF33",
    "#3333FF",
  ]

  // Get existing users or create empty array
  const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")

  // Generate 25 random users
  const dummyUsers = []

  for (let i = 0; i < 25; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const fullName = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`

    // Generate random interest
    const interest = interests[Math.floor(Math.random() * interests.length)]

    // Generate random bio
    const bioTemplate = bioTemplates[Math.floor(Math.random() * bioTemplates.length)]
    const bio = bioTemplate.replace("{interest}", interest)

    // Generate random location
    const location = locations[Math.floor(Math.random() * locations.length)]

    // Generate random birthday (between 18 and 60 years ago)
    const now = new Date()
    const year = now.getFullYear() - Math.floor(Math.random() * 42 + 18)
    const month = Math.floor(Math.random() * 12) + 1
    const day = Math.floor(Math.random() * 28) + 1
    const birthday = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`

    // Generate avatar (data URL with initials)
    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)]
    const initials = `${firstName[0]}${lastName[0]}`
    const avatarDataUrl = generateAvatarDataUrl(initials, avatarColor)

    // Create user object
    const user = {
      id: Date.now() + i,
      fullName,
      email,
      password: "password123", // Simple password for all dummy users
      bio,
      location,
      birthday,
      profilePic: avatarDataUrl,
      friends: [],
      friendRequests: [],
      sentRequests: [],
    }

    dummyUsers.push(user)
  }

  // Add dummy users to existing users
  const allUsers = [...existingUsers, ...dummyUsers]

  // Save to localStorage
  localStorage.setItem("users", JSON.stringify(allUsers))

  // Generate some friend connections
  generateFriendConnections(dummyUsers)

  // Generate some posts
  generateDummyPosts(dummyUsers)

  // Mark dummy data as loaded
  localStorage.setItem("dummyDataLoaded", "true")

  console.log("Generated 25 dummy users")
}

// Function to generate avatar data URL
function generateAvatarDataUrl(initials, bgColor) {
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")

  canvas.width = 200
  canvas.height = 200

  // Draw background
  context.fillStyle = bgColor
  context.fillRect(0, 0, canvas.width, canvas.height)

  // Draw text
  context.font = "bold 80px Arial"
  context.fillStyle = "white"
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(initials, canvas.width / 2, canvas.height / 2)

  return canvas.toDataURL("image/png")
}

// Function to generate friend connections
function generateFriendConnections(users) {
  // For each user, connect with 3-8 random other users
  users.forEach((user) => {
    const numConnections = Math.floor(Math.random() * 6) + 3 // 3-8 connections
    const otherUsers = users.filter((u) => u.id !== user.id)

    // Shuffle and take first numConnections
    const shuffled = otherUsers.sort(() => 0.5 - Math.random())
    const selectedUsers = shuffled.slice(0, numConnections)

    // Update both users' friend lists
    selectedUsers.forEach((friend) => {
      if (!user.friends.includes(friend.id)) {
        user.friends.push(friend.id)
      }

      if (!friend.friends.includes(user.id)) {
        friend.friends.push(user.id)
      }
    })
  })

  // Generate some pending friend requests
  users.forEach((user) => {
    // 20% chance of having pending requests
    if (Math.random() < 0.2) {
      const numRequests = Math.floor(Math.random() * 3) + 1 // 1-3 requests
      const nonFriends = users.filter(
        (u) =>
          u.id !== user.id &&
          !user.friends.includes(u.id) &&
          !user.friendRequests.includes(u.id) &&
          !user.sentRequests.includes(u.id),
      )

      if (nonFriends.length > 0) {
        const shuffled = nonFriends.sort(() => 0.5 - Math.random())
        const requesters = shuffled.slice(0, Math.min(numRequests, nonFriends.length))

        requesters.forEach((requester) => {
          user.friendRequests.push(requester.id)
          requester.sentRequests.push(user.id)
        })
      }
    }
  })

  // Update users in localStorage
  localStorage.setItem("users", JSON.stringify(users))
}

// Function to generate dummy posts
function generateDummyPosts(users) {
  // Post content templates
  const postTemplates = [
    "Just finished working on {interest}. So excited about the results!",
    "Does anyone have recommendations for learning more about {interest}?",
    "Spent the weekend exploring {interest}. It was amazing!",
    "Looking for people to collaborate on a {interest} project. DM me if interested!",
    "Just published my thoughts on {interest} on my blog. Check it out!",
    "Having a great time at the {interest} conference in {location}!",
    "Need advice on {interest}. What resources would you recommend?",
    "Happy to announce I'm starting a new journey with {interest}!",
    "Throwback to when I first discovered my passion for {interest}.",
    "Celebrating one year of working with {interest}. It's been an incredible journey!",
  ]

  // Get existing posts or create empty array
  const existingPosts = JSON.parse(localStorage.getItem("posts") || "[]")

  // Generate 40-60 random posts
  const numPosts = Math.floor(Math.random() * 21) + 40 // 40-60 posts
  const dummyPosts = []

  for (let i = 0; i < numPosts; i++) {
    // Select random user
    const user = users[Math.floor(Math.random() * users.length)]

    // Generate random post content
    const postTemplate = postTemplates[Math.floor(Math.random() * postTemplates.length)]
    const interest = user.bio.match(
      /passionate about (.*)|focused on (.*)|specializing in (.*)|passion for (.*)|working on (.*)|studying (.*)|building a startup in the (.*) space/,
    )
    const extractedInterest = interest
      ? interest[1] || interest[2] || interest[3] || interest[4] || interest[5] || interest[6] || interest[7]
      : "technology"

    const postText = postTemplate
      .replace("{interest}", extractedInterest)
      .replace("{location}", user.location.split(",")[0])

    // Random timestamp within the last 30 days
    const now = new Date()
    const randomDaysAgo = Math.floor(Math.random() * 30)
    const randomHoursAgo = Math.floor(Math.random() * 24)
    const randomMinutesAgo = Math.floor(Math.random() * 60)
    const timestamp = new Date(
      now - randomDaysAgo * 24 * 60 * 60 * 1000 - randomHoursAgo * 60 * 60 * 1000 - randomMinutesAgo * 60 * 1000,
    ).toISOString()

    // Create post object
    const post = {
      id: Date.now() + i,
      userId: user.id,
      userName: user.fullName,
      text: postText,
      image: Math.random() < 0.3 ? generateRandomImageUrl() : null, // 30% chance of having an image
      video: null,
      timestamp,
      likes: generateRandomLikes(users, user.id),
      comments: generateRandomComments(users, user.id),
    }

    dummyPosts.push(post)
  }

  // Sort posts by timestamp (newest first)
  dummyPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  // Add dummy posts to existing posts
  const allPosts = [...dummyPosts, ...existingPosts]

  // Save to localStorage
  localStorage.setItem("posts", JSON.stringify(allPosts))

  console.log(`Generated ${numPosts} dummy posts`)
}

// Function to generate random likes for a post
function generateRandomLikes(users, authorId) {
  const likes = []

  // 70% of users might like the post
  users.forEach((user) => {
    if (user.id !== authorId && Math.random() < 0.3) {
      likes.push(user.id)
    }
  })

  return likes
}

// Function to generate random comments for a post
function generateRandomComments(users, authorId) {
  const comments = []
  const commentTexts = [
    "Great post! Thanks for sharing.",
    "I completely agree with you!",
    "This is really interesting.",
    "I've been thinking about this too.",
    "Thanks for the insights!",
    "I had a similar experience recently.",
    "Could you share more details about this?",
    "This is exactly what I needed to hear today.",
    "I'm inspired by your journey!",
    "Looking forward to more content like this.",
  ]

  // Decide how many comments (0-5)
  const numComments = Math.floor(Math.random() * 6)

  for (let i = 0; i < numComments; i++) {
    // Select random user (not the author)
    const otherUsers = users.filter((u) => u.id !== authorId)
    const commenter = otherUsers[Math.floor(Math.random() * otherUsers.length)]

    // Random comment text
    const commentText = commentTexts[Math.floor(Math.random() * commentTexts.length)]

    // Random timestamp within the last day
    const now = new Date()
    const randomMinutesAgo = Math.floor(Math.random() * 60 * 24) // Within last 24 hours
    const timestamp = new Date(now - randomMinutesAgo * 60 * 1000).toISOString()

    // Create comment object
    const comment = {
      id: Date.now() + i,
      userId: commenter.id,
      userName: commenter.fullName,
      text: commentText,
      timestamp,
      likes: [],
    }

    comments.push(comment)
  }

  return comments
}

// Function to generate a random image URL (placeholder)
function generateRandomImageUrl() {
  const width = 600
  const height = 400
  const imageId = Math.floor(Math.random() * 1000)
  return `https://picsum.photos/seed/${imageId}/${width}/${height}`
}

// Run the generator when the script loads
document.addEventListener("DOMContentLoaded", generateDummyUsers)
