// Check if user is logged in
function checkAuth() {
  const currentUser = localStorage.getItem("currentUser")

  // If not logged in and not on login or signup page, redirect to login
  if (!currentUser) {
    const currentPath = window.location.pathname
    if (
      currentPath !== "/login.html" &&
      currentPath !== "/signup.html" &&
      currentPath !== "/index.html" &&
      currentPath !== "/"
    ) {
      window.location.href = "login.html"
    }
  } else {
    // If logged in and on login, signup, or index page, redirect to timeline
    const currentPath = window.location.pathname
    if (
      currentPath === "/login.html" ||
      currentPath === "/signup.html" ||
      currentPath === "/index.html" ||
      currentPath === "/"
    ) {
      window.location.href = "timeline.html"
    }

    // Update user info in the UI
    updateUserInfo(JSON.parse(currentUser))
  }
}

// Update user info in the UI
function updateUserInfo(user) {
  const userFullNameElements = document.querySelectorAll("#userFullName")
  if (userFullNameElements) {
    userFullNameElements.forEach((element) => {
      element.textContent = user.fullName
    })
  }

  // Update profile pictures if available
  if (user.profilePic) {
    const profilePicElements = [
      document.getElementById("navProfilePic"),
      document.getElementById("sidebarProfilePic"),
      document.getElementById("postProfilePic"),
    ]

    profilePicElements.forEach((element) => {
      if (element) {
        element.src = user.profilePic
      }
    })
  }

  // Update notification badge
  updateNotificationBadge()
}

// Update notification badge
function updateNotificationBadge() {
  const notificationBadge = document.getElementById("notificationBadge")
  if (!notificationBadge) return

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Find current user with updated data
  const updatedCurrentUser = users.find((user) => user.id === currentUser.id)

  if (updatedCurrentUser && updatedCurrentUser.friendRequests && updatedCurrentUser.friendRequests.length > 0) {
    notificationBadge.textContent = updatedCurrentUser.friendRequests.length
    notificationBadge.style.display = "flex"
  } else {
    notificationBadge.style.display = "none"
  }
}

// Handle signup form submission
if (document.getElementById("signupForm")) {
  document.getElementById("signupForm").addEventListener("submit", (e) => {
    e.preventDefault()

    const fullName = document.getElementById("fullName").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value

    // Validate form
    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    // Get existing users or create empty array
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Check if email already exists
    if (users.some((user) => user.email === email)) {
      alert("Email already exists!")
      return
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      password, // In a real app, this should be hashed
      friends: [],
      friendRequests: [],
      sentRequests: [],
    }

    // Add user to users array
    users.push(newUser)

    // Save users to localStorage
    localStorage.setItem("users", JSON.stringify(users))

    // Set current user
    localStorage.setItem("currentUser", JSON.stringify(newUser))

    // Initialize posts if not exists
    if (!localStorage.getItem("posts")) {
      localStorage.setItem("posts", JSON.stringify([]))
    }

    // Redirect to timeline
    window.location.href = "timeline.html"
  })
}

// Handle login form submission
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Find user with matching email and password
    const user = users.find((user) => user.email === email && user.password === password)

    if (user) {
      // Set current user
      localStorage.setItem("currentUser", JSON.stringify(user))

      // Redirect to timeline
      window.location.href = "timeline.html"
    } else {
      alert("Invalid email or password!")
    }
  })
}

// Handle logout
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()

      // Remove current user
      localStorage.removeItem("currentUser")

      // Redirect to login
      window.location.href = "login.html"
    })
  }

  // Toggle profile dropdown
  const profileDropdown = document.getElementById("profileDropdown")
  const profileMenu = document.getElementById("profileMenu")

  if (profileDropdown && profileMenu) {
    profileDropdown.addEventListener("click", (e) => {
      e.preventDefault()
      profileMenu.classList.toggle("active")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!profileDropdown.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.remove("active")
      }
    })
  }

  // Handle notifications dropdown
  const notificationsDropdown = document.getElementById("notificationsDropdown")
  const notificationsMenu = document.getElementById("notificationsMenu")

  if (notificationsDropdown && notificationsMenu) {
    notificationsDropdown.addEventListener("click", (e) => {
      e.preventDefault()
      notificationsMenu.classList.toggle("active")
      loadNotifications()
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!notificationsDropdown.contains(e.target) && !notificationsMenu.contains(e.target)) {
        notificationsMenu.classList.remove("active")
      }
    })
  }

  // Improve global search functionality
  const globalSearchInput = document.getElementById("globalSearchInput")
  const globalSearchBtn = document.getElementById("globalSearchBtn")

  if (globalSearchInput && globalSearchBtn) {
    globalSearchBtn.addEventListener("click", () => {
      const searchTerm = globalSearchInput.value.toLowerCase()
      if (searchTerm.trim() !== "") {
        // Redirect to friends page with search term
        window.location.href = `friends.html?search=${encodeURIComponent(searchTerm)}`
      }
    })

    globalSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const searchTerm = globalSearchInput.value.toLowerCase()
        if (searchTerm.trim() !== "") {
          // Redirect to friends page with search term
          window.location.href = `friends.html?search=${encodeURIComponent(searchTerm)}`
        }
      }
    })
  }

  // Load notifications function
  function loadNotifications() {
    const notificationsList = document.getElementById("notificationsList")
    if (!notificationsList) return

    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Find current user with updated data
    const updatedCurrentUser = users.find((user) => user.id === currentUser.id)

    if (!updatedCurrentUser || !updatedCurrentUser.friendRequests || updatedCurrentUser.friendRequests.length === 0) {
      notificationsList.innerHTML = '<div class="no-notifications">No friend requests</div>'
      return
    }

    // Clear list
    notificationsList.innerHTML = ""

    // Get users who sent friend requests
    updatedCurrentUser.friendRequests.forEach((requesterId) => {
      const requester = users.find((user) => user.id === requesterId)

      if (requester) {
        const requestElement = document.createElement("div")
        requestElement.className = "notification-item"
        requestElement.innerHTML = `
          <img src="${requester.profilePic || "images/default-avatar.png"}" alt="${requester.fullName}" class="avatar-small">
          <div class="notification-content">
            <div class="notification-text"><strong>${requester.fullName}</strong> sent you a friend request</div>
            <div class="notification-actions">
              <button class="notification-btn accept-btn" data-user-id="${requester.id}">Accept</button>
              <button class="notification-btn reject-btn" data-user-id="${requester.id}">Reject</button>
            </div>
          </div>
        `

        notificationsList.appendChild(requestElement)
      }
    })

    // Add event listeners for notification actions
    const acceptButtons = notificationsList.querySelectorAll(".accept-btn")
    acceptButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id")
        acceptFriendRequest(userId)
      })
    })

    const rejectButtons = notificationsList.querySelectorAll(".reject-btn")
    rejectButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id")
        rejectFriendRequest(userId)
      })
    })
  }

  // Accept friend request
  function acceptFriendRequest(userId) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Find current user and requester
    const currentUserIndex = users.findIndex((user) => user.id === currentUser.id)
    const requesterIndex = users.findIndex((user) => user.id === userId)

    if (currentUserIndex !== -1 && requesterIndex !== -1) {
      // Remove from friend requests
      const requestIndex = users[currentUserIndex].friendRequests.indexOf(userId)
      if (requestIndex !== -1) {
        users[currentUserIndex].friendRequests.splice(requestIndex, 1)
      }

      // Remove from sent requests
      const sentIndex = users[requesterIndex].sentRequests.indexOf(currentUser.id)
      if (sentIndex !== -1) {
        users[requesterIndex].sentRequests.splice(sentIndex, 1)
      }

      // Add to friends for both users
      if (!users[currentUserIndex].friends.includes(userId)) {
        users[currentUserIndex].friends.push(userId)
      }

      if (!users[requesterIndex].friends.includes(currentUser.id)) {
        users[requesterIndex].friends.push(currentUser.id)
      }

      // Update users in localStorage
      localStorage.setItem("users", JSON.stringify(users))
      localStorage.setItem("currentUser", JSON.stringify(users[currentUserIndex]))

      // Update notification badge
      updateNotificationBadge()

      // Reload notifications
      loadNotifications()
    }
  }

  // Reject friend request
  function rejectFriendRequest(userId) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Find current user and requester
    const currentUserIndex = users.findIndex((user) => user.id === currentUser.id)
    const requesterIndex = users.findIndex((user) => user.id === userId)

    if (currentUserIndex !== -1 && requesterIndex !== -1) {
      // Remove from friend requests
      const requestIndex = users[currentUserIndex].friendRequests.indexOf(userId)
      if (requestIndex !== -1) {
        users[currentUserIndex].friendRequests.splice(requestIndex, 1)
      }

      // Remove from sent requests
      const sentIndex = users[requesterIndex].sentRequests.indexOf(currentUser.id)
      if (sentIndex !== -1) {
        users[requesterIndex].sentRequests.splice(sentIndex, 1)
      }

      // Update users in localStorage
      localStorage.setItem("users", JSON.stringify(users))
      localStorage.setItem("currentUser", JSON.stringify(users[currentUserIndex]))

      // Update notification badge
      updateNotificationBadge()

      // Reload notifications
      loadNotifications()
    }
  }

  // Check authentication
  checkAuth()
})
