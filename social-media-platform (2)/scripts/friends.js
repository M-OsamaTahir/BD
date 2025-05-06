document.addEventListener("DOMContentLoaded", () => {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) return

  // Load friends, requests, and people
  loadFriends()
  loadFriendRequests()
  loadPeople()
  loadAllUsers()
  updateNotificationBadge()

  // Fix tab switching - completely rewritten
  const tabButtons = document.querySelectorAll(".friends-tabs .tab-btn")

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      console.log("Tab button clicked:", this.getAttribute("data-tab"))

      // Remove active class from all buttons
      tabButtons.forEach((btn) => btn.classList.remove("active"))

      // Add active class to clicked button
      this.classList.add("active")

      // Get the tab id
      const tabId = this.getAttribute("data-tab")

      // Hide all tab content
      const tabContents = document.querySelectorAll(".tab-content")
      tabContents.forEach((content) => content.classList.add("hidden"))

      // Show selected tab content
      const selectedTab = document.getElementById(tabId)
      if (selectedTab) {
        selectedTab.classList.remove("hidden")
      }
    })
  })

  // Handle search
  const searchInput = document.getElementById("searchPeople")
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      filterPeople(searchTerm)
    })
  }

  // Handle search button
  const searchPeopleBtn = document.getElementById("searchPeopleBtn")
  if (searchPeopleBtn) {
    searchPeopleBtn.addEventListener("click", () => {
      const searchTerm = document.getElementById("searchPeople").value.toLowerCase()
      filterPeople(searchTerm)
    })
  }

  // Handle filter for all users
  const filterAllUsersInput = document.getElementById("filterAllUsers")
  if (filterAllUsersInput) {
    filterAllUsersInput.addEventListener("input", function () {
      const filterTerm = this.value.toLowerCase()
      filterAllUsers(filterTerm)
    })
  }

  // Handle filter button for all users
  const filterAllUsersBtn = document.getElementById("filterAllUsersBtn")
  if (filterAllUsersBtn) {
    filterAllUsersBtn.addEventListener("click", () => {
      const filterTerm = document.getElementById("filterAllUsers").value.toLowerCase()
      filterAllUsers(filterTerm)
    })
  }

  // Handle global search
  const globalSearchInput = document.getElementById("globalSearchInput")
  const globalSearchBtn = document.getElementById("globalSearchBtn")

  if (globalSearchInput && globalSearchBtn) {
    globalSearchBtn.addEventListener("click", () => {
      const searchTerm = globalSearchInput.value.toLowerCase()
      if (searchTerm.trim() !== "") {
        // Switch to all users tab and filter
        showAllUsersTab(searchTerm)
      }
    })

    globalSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const searchTerm = globalSearchInput.value.toLowerCase()
        if (searchTerm.trim() !== "") {
          // Switch to all users tab and filter
          showAllUsersTab(searchTerm)
        }
      }
    })
  }

  // Function to show all users tab and filter
  function showAllUsersTab(searchTerm) {
    // Switch to all users tab
    tabButtons.forEach((btn) => btn.classList.remove("active"))
    const allUsersTabBtn = document.querySelector('[data-tab="all-users"]')
    if (allUsersTabBtn) {
      allUsersTabBtn.classList.add("active")
    }

    // Hide all tab content
    const tabContents = document.querySelectorAll(".tab-content")
    tabContents.forEach((content) => content.classList.add("hidden"))

    // Show all users tab
    const allUsersTab = document.getElementById("all-users")
    if (allUsersTab) {
      allUsersTab.classList.remove("hidden")
    }

    // Set filter input value and filter
    const filterInput = document.getElementById("filterAllUsers")
    if (filterInput) {
      filterInput.value = searchTerm
      filterAllUsers(searchTerm)
    }
  }

  // Check for search parameter in URL
  const urlParams = new URLSearchParams(window.location.search)
  const searchParam = urlParams.get("search")

  if (searchParam) {
    showAllUsersTab(searchParam)
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
})

// Load friends
function loadFriends() {
  const friendsGrid = document.getElementById("friendsGrid")
  if (!friendsGrid) return

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Find current user with updated data
  const updatedCurrentUser = users.find((user) => user.id === currentUser.id)

  if (!updatedCurrentUser || !updatedCurrentUser.friends || updatedCurrentUser.friends.length === 0) {
    friendsGrid.innerHTML = "<p>You have no friends yet. Add some friends to see them here.</p>"
    return
  }

  // Clear grid
  friendsGrid.innerHTML = ""

  // Get friends
  updatedCurrentUser.friends.forEach((friendId) => {
    const friend = users.find((user) => user.id === friendId)

    if (friend) {
      const friendElement = document.createElement("div")
      friendElement.className = "friend-card"
      friendElement.innerHTML = `
        <img src="${friend.profilePic || "images/default-avatar.png"}" alt="${friend.fullName}" class="friend-avatar">
        <div class="friend-name">${friend.fullName}</div>
        <div class="friend-actions">
          <button class="btn btn-primary view-profile-btn" data-user-id="${friend.id}">View Profile</button>
          <button class="btn btn-danger unfriend-btn" data-user-id="${friend.id}">Unfriend</button>
        </div>
      `

      friendsGrid.appendChild(friendElement)
    }
  })

  // Add event listeners for friend actions
  addFriendActionListeners()
}

// Add event listeners for friend actions
function addFriendActionListeners() {
  // View profile
  const viewProfileButtons = document.querySelectorAll(".view-profile-btn")
  viewProfileButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const userId = this.getAttribute("data-user-id")
      alert("View profile functionality would be implemented here in a real app.")
      // In a real app, this would redirect to the user's profile page
      // window.location.href = `profile.html?id=${userId}`;
    })
  })

  // Unfriend
  const unfriendButtons = document.querySelectorAll(".unfriend-btn")
  unfriendButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const userId = this.getAttribute("data-user-id")
      unfriend(userId)
    })
  })
}

// Unfriend a user
function unfriend(userId) {
  if (confirm("Are you sure you want to unfriend this person?")) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Find current user and friend
    const currentUserIndex = users.findIndex((user) => user.id === currentUser.id)
    const friendIndex = users.findIndex((user) => user.id === userId)

    if (currentUserIndex !== -1 && friendIndex !== -1) {
      // Remove from current user's friends
      const friendIndexInCurrentUser = users[currentUserIndex].friends.indexOf(userId)
      if (friendIndexInCurrentUser !== -1) {
        users[currentUserIndex].friends.splice(friendIndexInCurrentUser, 1)
      }

      // Remove from friend's friends
      const currentUserIndexInFriend = users[friendIndex].friends.indexOf(currentUser.id)
      if (currentUserIndexInFriend !== -1) {
        users[friendIndex].friends.splice(currentUserIndexInFriend, 1)
      }

      // Update users in localStorage
      localStorage.setItem("users", JSON.stringify(users))
      localStorage.setItem("currentUser", JSON.stringify(users[currentUserIndex]))

      // Reload friends
      loadFriends()
    }
  }
}

// Load friend requests
function loadFriendRequests() {
  const friendRequestsList = document.getElementById("friendRequestsList")
  if (!friendRequestsList) return

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Find current user with updated data
  const updatedCurrentUser = users.find((user) => user.id === currentUser.id)

  if (!updatedCurrentUser || !updatedCurrentUser.friendRequests || updatedCurrentUser.friendRequests.length === 0) {
    friendRequestsList.innerHTML = "<p>You have no friend requests.</p>"
    return
  }

  // Clear list
  friendRequestsList.innerHTML = ""

  // Get users who sent friend requests
  updatedCurrentUser.friendRequests.forEach((requesterId) => {
    const requester = users.find((user) => user.id === requesterId)

    if (requester) {
      const requestElement = document.createElement("div")
      requestElement.className = "friend-request-item"
      requestElement.innerHTML = `
        <img src="${requester.profilePic || "images/default-avatar.png"}" alt="${requester.fullName}" class="avatar-small">
        <div class="friend-info">
          <div class="friend-name">${requester.fullName}</div>
          <div class="friend-actions">
            <button class="friend-action-btn accept-btn" data-user-id="${requester.id}">Accept</button>
            <button class="friend-action-btn reject-btn" data-user-id="${requester.id}">Reject</button>
          </div>
        </div>
      `

      friendRequestsList.appendChild(requestElement)
    }
  })

  // Add event listeners for friend request actions
  const acceptButtons = document.querySelectorAll(".accept-btn")
  acceptButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const userId = this.getAttribute("data-user-id")
      acceptFriendRequest(userId)
    })
  })

  const rejectButtons = document.querySelectorAll(".reject-btn")
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

    // Reload friend requests and friends
    loadFriendRequests()
    loadFriends()
    updateNotificationBadge()
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

    // Reload friend requests
    loadFriendRequests()
    updateNotificationBadge()
  }
}

// Improve the people search functionality
function loadPeople() {
  const peopleGrid = document.getElementById("peopleGrid")
  if (!peopleGrid) return

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Find current user with updated data
  const updatedCurrentUser = users.find((user) => user.id === currentUser.id)

  // Filter users who are not friends and have not sent/received friend requests
  const people = users.filter(
    (user) =>
      user.id !== currentUser.id &&
      !updatedCurrentUser.friends.includes(user.id) &&
      !updatedCurrentUser.friendRequests.includes(user.id) &&
      !updatedCurrentUser.sentRequests.includes(user.id),
  )

  if (people.length === 0) {
    peopleGrid.innerHTML = "<p>No people to add as friends.</p>"
    return
  }

  // Clear grid
  peopleGrid.innerHTML = ""

  // Display people
  people.forEach((person) => {
    const personElement = document.createElement("div")
    personElement.className = "person-card"
    personElement.dataset.name = person.fullName.toLowerCase()
    personElement.innerHTML = `
      <img src="${person.profilePic || "images/default-avatar.png"}" alt="${person.fullName}" class="person-avatar">
      <div class="person-name">${person.fullName}</div>
      <div class="person-actions">
        <button class="btn btn-primary add-friend-btn" data-user-id="${person.id}">Add Friend</button>
      </div>
    `

    peopleGrid.appendChild(personElement)
  })

  // Add event listeners for add friend buttons
  const addFriendButtons = document.querySelectorAll(".add-friend-btn")
  addFriendButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const userId = this.getAttribute("data-user-id")
      sendFriendRequest(userId)
    })
  })
}

// Improve the load all users function to include all users
function loadAllUsers() {
  const allUsersGrid = document.getElementById("allUsersGrid")
  if (!allUsersGrid) return

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Find current user with updated data
  const updatedCurrentUser = users.find((user) => user.id === currentUser.id)

  // Filter out current user
  const allOtherUsers = users.filter((user) => user.id !== currentUser.id)

  if (allOtherUsers.length === 0) {
    allUsersGrid.innerHTML = "<p>No other users registered.</p>"
    return
  }

  // Clear grid
  allUsersGrid.innerHTML = ""

  // Display all users
  allOtherUsers.forEach((user) => {
    const isFriend = updatedCurrentUser.friends.includes(user.id)
    const hasSentRequest = updatedCurrentUser.sentRequests.includes(user.id)
    const hasReceivedRequest = updatedCurrentUser.friendRequests.includes(user.id)

    let actionButton = ""
    if (isFriend) {
      actionButton = `<button class="btn btn-secondary" disabled>Friends</button>`
    } else if (hasSentRequest) {
      actionButton = `<button class="btn btn-secondary" disabled>Request Sent</button>`
    } else if (hasReceivedRequest) {
      actionButton = `
        <button class="friend-action-btn accept-btn" data-user-id="${user.id}">Accept</button>
        <button class="friend-action-btn reject-btn" data-user-id="${user.id}">Reject</button>
      `
    } else {
      actionButton = `<button class="btn btn-primary add-friend-btn" data-user-id="${user.id}">Add Friend</button>`
    }

    const userElement = document.createElement("div")
    userElement.className = "person-card"
    userElement.dataset.name = user.fullName.toLowerCase()
    userElement.innerHTML = `
      <img src="${user.profilePic || "images/default-avatar.png"}" alt="${user.fullName}" class="person-avatar">
      <div class="person-name">${user.fullName}</div>
      <div class="person-bio">${user.bio ? user.bio.substring(0, 60) + (user.bio.length > 60 ? "..." : "") : ""}</div>
      <div class="person-actions">
        ${actionButton}
      </div>
    `

    allUsersGrid.appendChild(userElement)
  })

  // Add event listeners for buttons
  const addFriendButtons = allUsersGrid.querySelectorAll(".add-friend-btn")
  addFriendButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const userId = this.getAttribute("data-user-id")
      sendFriendRequest(userId)
    })
  })

  const acceptButtons = allUsersGrid.querySelectorAll(".accept-btn")
  acceptButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const userId = this.getAttribute("data-user-id")
      acceptFriendRequest(userId)
    })
  })

  const rejectButtons = allUsersGrid.querySelectorAll(".reject-btn")
  rejectButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const userId = this.getAttribute("data-user-id")
      rejectFriendRequest(userId)
    })
  })
}

// Improve the filter people function to better match names
function filterPeople(searchTerm) {
  const personCards = document.querySelectorAll("#peopleGrid .person-card")
  let hasResults = false

  personCards.forEach((card) => {
    const name = card.dataset.name

    if (name.includes(searchTerm)) {
      card.style.display = "block"
      hasResults = true
    } else {
      card.style.display = "none"
    }
  })

  // Show a message if no results found
  const noResultsMessage = document.getElementById("no-search-results")
  if (!hasResults) {
    if (!noResultsMessage) {
      const message = document.createElement("p")
      message.id = "no-search-results"
      message.className = "no-results"
      message.textContent = `No results found for "${searchTerm}"`
      document.getElementById("peopleGrid").appendChild(message)
    }
  } else if (noResultsMessage) {
    noResultsMessage.remove()
  }
}

// Improve the filter all users function
function filterAllUsers(filterTerm) {
  const userCards = document.querySelectorAll("#allUsersGrid .person-card")
  let hasResults = false

  userCards.forEach((card) => {
    const name = card.dataset.name

    if (name.includes(filterTerm)) {
      card.style.display = "block"
      hasResults = true
    } else {
      card.style.display = "none"
    }
  })

  // Show a message if no results found
  const noResultsMessage = document.getElementById("no-filter-results")
  if (!hasResults) {
    if (!noResultsMessage) {
      const message = document.createElement("p")
      message.id = "no-filter-results"
      message.className = "no-results"
      message.textContent = `No results found for "${filterTerm}"`
      document.getElementById("allUsersGrid").appendChild(message)
    }
  } else if (noResultsMessage) {
    noResultsMessage.remove()
  }
}

// Send friend request
function sendFriendRequest(userId) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Find current user and recipient
  const currentUserIndex = users.findIndex((user) => user.id === currentUser.id)
  const recipientIndex = users.findIndex((user) => user.id === userId)

  if (currentUserIndex !== -1 && recipientIndex !== -1) {
    // Add to recipient's friend requests
    if (!users[recipientIndex].friendRequests.includes(currentUser.id)) {
      users[recipientIndex].friendRequests.push(currentUser.id)
    }

    // Add to current user's sent requests
    if (!users[currentUserIndex].sentRequests.includes(userId)) {
      users[currentUserIndex].sentRequests.push(userId)
    }

    // Update users in localStorage
    localStorage.setItem("users", JSON.stringify(users))
    localStorage.setItem("currentUser", JSON.stringify(users[currentUserIndex]))

    // Reload people and all users
    loadPeople()
    loadAllUsers()

    alert("Friend request sent!")
  }
}

// Load notifications
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
