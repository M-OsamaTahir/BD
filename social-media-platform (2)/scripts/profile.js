document.addEventListener("DOMContentLoaded", () => {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) return

  // Load user profile data
  loadProfileData()

  // Handle tab switching
  const tabButtons = document.querySelectorAll(".tab-btn")
  if (tabButtons) {
    tabButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Remove active class from all buttons
        tabButtons.forEach((btn) => btn.classList.remove("active"))

        // Add active class to clicked button
        this.classList.add("active")

        // Hide all tab content
        const tabContents = document.querySelectorAll(".tab-content")
        tabContents.forEach((content) => content.classList.add("hidden"))

        // Show selected tab content
        const tabId = this.getAttribute("data-tab")
        document.getElementById(tabId).classList.remove("hidden")
      })
    })
  }

  // Handle profile picture upload
  const profilePicInput = document.getElementById("profilePicInput")
  if (profilePicInput) {
    profilePicInput.addEventListener("change", handleProfilePicUpload)
  }

  // Handle profile edit form submission
  const profileEditForm = document.getElementById("profileEditForm")
  if (profileEditForm) {
    profileEditForm.addEventListener("submit", handleProfileUpdate)
  }

  // Load user posts
  loadUserPosts()

  // Load user friends
  loadUserFriends()
})

// Load profile data
function loadProfileData() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Find current user with updated data
  const updatedUser = users.find((user) => user.id === currentUser.id) || currentUser

  // Update profile name
  const profileNameElement = document.getElementById("profileName")
  if (profileNameElement) {
    profileNameElement.textContent = updatedUser.fullName
  }

  // Update form fields
  const fullNameInput = document.getElementById("fullName")
  if (fullNameInput) {
    fullNameInput.value = updatedUser.fullName
  }

  const bioInput = document.getElementById("bio")
  if (bioInput) {
    bioInput.value = updatedUser.bio || ""
  }

  const locationInput = document.getElementById("location")
  if (locationInput) {
    locationInput.value = updatedUser.location || ""
  }

  const birthdayInput = document.getElementById("birthday")
  if (birthdayInput) {
    birthdayInput.value = updatedUser.birthday || ""
  }

  // Update profile picture if exists
  if (updatedUser.profilePic) {
    updateProfilePictures(updatedUser.profilePic)
  }

  // Display user info in the about section
  updateAboutSection(updatedUser)
}

// Update the about section with user info
function updateAboutSection(user) {
  const aboutSection = document.getElementById("about")
  if (!aboutSection) return

  // Check if user info display already exists
  const existingUserInfo = aboutSection.querySelector(".user-info-display")

  // If it exists, update it; otherwise, create it
  if (existingUserInfo) {
    // Update existing info
    const bioElement = existingUserInfo.querySelector(".user-bio")
    const locationElement = existingUserInfo.querySelector(".user-location")
    const birthdayElement = existingUserInfo.querySelector(".user-birthday")

    if (bioElement) bioElement.textContent = user.bio || "No bio added yet"
    if (locationElement) locationElement.textContent = user.location || "No location added yet"
    if (birthdayElement)
      birthdayElement.textContent = user.birthday
        ? new Date(user.birthday).toLocaleDateString()
        : "No birthday added yet"
  }
}

// Handle profile picture upload
function handleProfilePicUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const profilePic = e.target.result

    // Update profile pictures in UI
    updateProfilePictures(profilePic)

    // Update user data
    updateUserProfilePic(profilePic)
  }
  reader.readAsDataURL(file)
}

// Update all profile pictures in the UI
function updateProfilePictures(profilePic) {
  const profilePicElements = [
    document.getElementById("profilePagePic"),
    document.getElementById("navProfilePic"),
    document.getElementById("sidebarProfilePic"),
  ]

  profilePicElements.forEach((element) => {
    if (element) {
      element.src = profilePic
    }
  })
}

// Update user profile picture in localStorage
function updateUserProfilePic(profilePic) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Update in users array
  const userIndex = users.findIndex((user) => user.id === currentUser.id)
  if (userIndex !== -1) {
    users[userIndex].profilePic = profilePic
    localStorage.setItem("users", JSON.stringify(users))
  }

  // Update current user
  currentUser.profilePic = profilePic
  localStorage.setItem("currentUser", JSON.stringify(currentUser))
}

// Handle profile update
function handleProfileUpdate(event) {
  event.preventDefault()

  const fullName = document.getElementById("fullName").value
  const bio = document.getElementById("bio").value
  const location = document.getElementById("location").value
  const birthday = document.getElementById("birthday").value

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Update in users array
  const userIndex = users.findIndex((user) => user.id === currentUser.id)
  if (userIndex !== -1) {
    users[userIndex].fullName = fullName
    users[userIndex].bio = bio
    users[userIndex].location = location
    users[userIndex].birthday = birthday
    localStorage.setItem("users", JSON.stringify(users))
  }

  // Update current user
  currentUser.fullName = fullName
  currentUser.bio = bio
  currentUser.location = location
  currentUser.birthday = birthday
  localStorage.setItem("currentUser", JSON.stringify(currentUser))

  // Update UI
  document.getElementById("profileName").textContent = fullName

  // Update the about section
  updateAboutSection({
    fullName,
    bio,
    location,
    birthday,
  })

  // Show success message
  alert("Profile updated successfully!")
}

// Load user posts
function loadUserPosts() {
  const userPostsContainer = document.getElementById("userPostsContainer")
  if (!userPostsContainer) return

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const posts = JSON.parse(localStorage.getItem("posts") || "[]")

  // Filter posts by current user
  const userPosts = posts.filter((post) => post.userId === currentUser.id)

  if (userPosts.length === 0) {
    userPostsContainer.innerHTML = "<p>You haven't posted anything yet.</p>"
    return
  }

  // Clear container
  userPostsContainer.innerHTML = ""

  // Display posts
  userPosts.forEach((post) => {
    let mediaHtml = ""
    if (post.image) {
      mediaHtml = `<img src="${post.image}" alt="Post image" class="post-image">`
    } else if (post.video) {
      mediaHtml = `<video src="${post.video}" controls class="post-video"></video>`
    }

    const postElement = document.createElement("div")
    postElement.className = "post"
    postElement.innerHTML = `
      <div class="post-header">
        <img src="${currentUser.profilePic || "images/default-avatar.png"}" alt="${post.userName}" class="avatar-small">
        <div class="post-user-info">
          <div class="post-user-name">${post.userName}</div>
          <div class="post-time">${formatDate(post.timestamp)}</div>
        </div>
      </div>
      <div class="post-content">
        <p class="post-text">${post.text}</p>
        ${mediaHtml}
      </div>
      <div class="post-stats">
        <div class="likes-count">${post.likes.length} likes</div>
        <div class="comments-count">${post.comments.length} comments</div>
      </div>
    `

    userPostsContainer.appendChild(postElement)
  })
}

// Load user friends
function loadUserFriends() {
  const profileFriendsGrid = document.getElementById("profileFriendsGrid")
  if (!profileFriendsGrid) return

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Find current user with updated data
  const updatedUser = users.find((user) => user.id === currentUser.id) || currentUser

  if (!updatedUser.friends || updatedUser.friends.length === 0) {
    profileFriendsGrid.innerHTML = "<p>You don't have any friends yet.</p>"
    return
  }

  // Clear grid
  profileFriendsGrid.innerHTML = ""

  // Get friends
  updatedUser.friends.forEach((friendId) => {
    const friend = users.find((user) => user.id === friendId)

    if (friend) {
      const friendElement = document.createElement("div")
      friendElement.className = "friend-card"
      friendElement.innerHTML = `
        <img src="${friend.profilePic || "images/default-avatar.png"}" alt="${friend.fullName}" class="friend-avatar">
        <div class="friend-name">${friend.fullName}</div>
      `

      profileFriendsGrid.appendChild(friendElement)
    }
  })
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) {
    return "Just now"
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`
  } else {
    return date.toLocaleDateString()
  }
}
