document.addEventListener("DOMContentLoaded", () => {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) return

  // Load posts
  loadPosts()

  // Load friend requests
  loadFriendRequests()

  // Load suggested friends
  loadSuggestedFriends()

  // Update notification badge
  updateNotificationBadge()

  // Handle post creation
  const postSubmitBtn = document.querySelector(".post-submit")
  if (postSubmitBtn) {
    postSubmitBtn.addEventListener("click", createPost)
  }

  // Handle file inputs
  const photoBtn = document.querySelector(".post-action-btn:nth-child(1)")
  const videoBtn = document.querySelector(".post-action-btn:nth-child(2)")

  if (photoBtn) {
    photoBtn.addEventListener("click", () => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"
      input.onchange = handleImageUpload
      input.click()
    })
  }

  if (videoBtn) {
    videoBtn.addEventListener("click", () => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "video/*"
      input.onchange = handleVideoUpload
      input.click()
    })
  }

  // Handle global search
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

  // Handle profile dropdown
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
})

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

    // Reload friend requests in sidebar
    loadFriendRequests()
    loadSuggestedFriends()
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

    // Reload friend requests in sidebar
    loadFriendRequests()
  }
}

// Global variables for media uploads
let selectedImage = null
let selectedVideo = null

// Handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0]
  if (file) {
    selectedImage = file
    selectedVideo = null // Reset video if image is selected

    // Show preview of the selected image
    const postTextarea = document.querySelector(".post-input textarea")
    const previewContainer = document.createElement("div")
    previewContainer.className = "media-preview"

    if (document.querySelector(".media-preview")) {
      document.querySelector(".media-preview").remove()
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      previewContainer.innerHTML = `
        <div class="preview-header">
          <span>Selected Image</span>
          <button type="button" class="remove-media-btn"><i class="fas fa-times"></i></button>
        </div>
        <img src="${e.target.result}" alt="Preview" class="preview-image">
      `
      postTextarea.parentNode.insertBefore(previewContainer, postTextarea.nextSibling)

      // Add event listener to remove button
      document.querySelector(".remove-media-btn").addEventListener("click", () => {
        previewContainer.remove()
        selectedImage = null
      })
    }
    reader.readAsDataURL(file)
  }
}

// Handle video upload
function handleVideoUpload(event) {
  const file = event.target.files[0]
  if (file) {
    selectedVideo = file
    selectedImage = null // Reset image if video is selected

    // Show preview of the selected video
    const postTextarea = document.querySelector(".post-input textarea")
    const previewContainer = document.createElement("div")
    previewContainer.className = "media-preview"

    if (document.querySelector(".media-preview")) {
      document.querySelector(".media-preview").remove()
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      previewContainer.innerHTML = `
        <div class="preview-header">
          <span>Selected Video</span>
          <button type="button" class="remove-media-btn"><i class="fas fa-times"></i></button>
        </div>
        <video src="${e.target.result}" controls class="preview-video"></video>
      `
      postTextarea.parentNode.insertBefore(previewContainer, postTextarea.nextSibling)

      // Add event listener to remove button
      document.querySelector(".remove-media-btn").addEventListener("click", () => {
        previewContainer.remove()
        selectedVideo = null
      })
    }
    reader.readAsDataURL(file)
  }
}

// Create a new post
function createPost() {
  const postTextarea = document.querySelector(".post-input textarea")
  const postText = postTextarea.value.trim()

  if (!postText && !selectedImage && !selectedVideo) {
    alert("Please enter some text or select media to post.")
    return
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // Create post object
  const newPost = {
    id: Date.now().toString(),
    userId: currentUser.id,
    userName: currentUser.fullName,
    text: postText,
    image: null,
    video: null,
    timestamp: new Date().toISOString(),
    likes: [],
    comments: [],
  }

  // Handle image or video
  if (selectedImage) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newPost.image = e.target.result
      saveAndDisplayPost(newPost)
    }
    reader.readAsDataURL(selectedImage)
  } else if (selectedVideo) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newPost.video = e.target.result
      saveAndDisplayPost(newPost)
    }
    reader.readAsDataURL(selectedVideo)
  } else {
    saveAndDisplayPost(newPost)
  }
}

// Save post to localStorage and display it
function saveAndDisplayPost(post) {
  // Get existing posts
  const posts = JSON.parse(localStorage.getItem("posts") || "[]")

  // Add new post to beginning of array
  posts.unshift(post)

  // Save posts to localStorage
  localStorage.setItem("posts", JSON.stringify(posts))

  // Clear form
  document.querySelector(".post-input textarea").value = ""
  selectedImage = null
  selectedVideo = null

  // Remove media preview if exists
  if (document.querySelector(".media-preview")) {
    document.querySelector(".media-preview").remove()
  }

  // Reload posts
  loadPosts()
}

// Load posts from localStorage
function loadPosts() {
  const postsContainer = document.getElementById("postsContainer")
  if (!postsContainer) return

  // Get posts from localStorage
  const posts = JSON.parse(localStorage.getItem("posts") || "[]")
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Clear posts container
  postsContainer.innerHTML = ""

  // Display posts
  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <div class="post">
        <p class="text-center">No posts yet. Be the first to post!</p>
      </div>
    `
    return
  }

  posts.forEach((post) => {
    const isLiked = post.likes.includes(currentUser.id)
    const postUser = users.find((user) => user.id === post.userId) || { profilePic: null }

    let mediaHtml = ""
    if (post.image) {
      mediaHtml = `<img src="${post.image}" alt="Post image" class="post-image">`
    } else if (post.video) {
      mediaHtml = `<video src="${post.video}" controls class="post-video"></video>`
    }

    const postElement = document.createElement("div")
    postElement.className = "post"
    postElement.dataset.postId = post.id
    postElement.innerHTML = `
      <div class="post-header">
        <img src="${postUser.profilePic || "images/default-avatar.png"}" alt="${post.userName}" class="avatar-small">
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
      <div class="post-actions">
        <div class="post-action like-action ${isLiked ? "liked" : ""}" data-post-id="${post.id}">
          <i class="fas ${isLiked ? "fa-heart" : "fa-heart"}"></i> Like
        </div>
        <div class="post-action comment-action" data-post-id="${post.id}">
          <i class="fas fa-comment"></i> Comment
        </div>
        <div class="post-action share-action" data-post-id="${post.id}">
          <i class="fas fa-share"></i> Share
        </div>
      </div>
      <div class="comments-section" id="comments-${post.id}">
        ${renderComments(post.comments, users)}
        <div class="comment-form">
          <img src="${currentUser.profilePic || "images/default-avatar.png"}" alt="${currentUser.fullName}" class="avatar-small">
          <input type="text" class="comment-input" placeholder="Write a comment..." data-post-id="${post.id}">
        </div>
      </div>
    `

    postsContainer.appendChild(postElement)
  })

  // Add event listeners for post actions
  addPostActionListeners()
}

// Render comments for a post
function renderComments(comments, users) {
  if (comments.length === 0) return ""

  let commentsHtml = ""

  comments.forEach((comment) => {
    const commentUser = users.find((user) => user.id === comment.userId) || { profilePic: null }

    commentsHtml += `
      <div class="comment">
        <img src="${commentUser.profilePic || "images/default-avatar.png"}" alt="${comment.userName}" class="avatar-small">
        <div class="comment-content">
          <div class="comment-user">${comment.userName}</div>
          <div class="comment-text">${comment.text}</div>
          <div class="comment-actions">
            <div class="comment-action like-comment" data-comment-id="${comment.id}">Like</div>
            <div class="comment-action reply-comment" data-comment-id="${comment.id}">Reply</div>
            <div class="comment-time">${formatDate(comment.timestamp)}</div>
          </div>
        </div>
      </div>
    `
  })

  return commentsHtml
}

// Add event listeners for post actions
function addPostActionListeners() {
  // Like action
  const likeActions = document.querySelectorAll(".like-action")
  likeActions.forEach((action) => {
    action.addEventListener("click", function () {
      const postId = this.getAttribute("data-post-id")
      likePost(postId)
    })
  })

  // Comment input
  const commentInputs = document.querySelectorAll(".comment-input")
  commentInputs.forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        const postId = this.getAttribute("data-post-id")
        const commentText = this.value.trim()

        if (commentText) {
          addComment(postId, commentText)
          this.value = ""
        }
      }
    })
  })

  // Comment action (focus on input)
  const commentActions = document.querySelectorAll(".comment-action")
  commentActions.forEach((action) => {
    action.addEventListener("click", function () {
      const postId = this.getAttribute("data-post-id")
      if (postId) {
        const commentInput = document.querySelector(`#comments-${postId} .comment-input`)
        if (commentInput) {
          commentInput.focus()
        }
      }
    })
  })

  // Share action
  const shareActions = document.querySelectorAll(".share-action")
  shareActions.forEach((action) => {
    action.addEventListener("click", () => {
      alert("Sharing functionality would be implemented here in a real app.")
    })
  })
}

// Like a post
function likePost(postId) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const posts = JSON.parse(localStorage.getItem("posts") || "[]")

  const postIndex = posts.findIndex((post) => post.id === postId)

  if (postIndex !== -1) {
    const post = posts[postIndex]
    const likeIndex = post.likes.indexOf(currentUser.id)

    if (likeIndex === -1) {
      // Add like
      post.likes.push(currentUser.id)
    } else {
      // Remove like
      post.likes.splice(likeIndex, 1)
    }

    // Update posts in localStorage
    localStorage.setItem("posts", JSON.stringify(posts))

    // Update just the likes count and like button without reloading all posts
    updatePostLikes(postId, post.likes.length, post.likes.includes(currentUser.id))
  }
}

// Update post likes without reloading all posts
function updatePostLikes(postId, likesCount, isLiked) {
  const postElement = document.querySelector(`.post[data-post-id="${postId}"]`)
  if (!postElement) return

  // Update likes count
  const likesCountElement = postElement.querySelector(".likes-count")
  if (likesCountElement) {
    likesCountElement.textContent = `${likesCount} likes`
  }

  // Update like button
  const likeButton = postElement.querySelector(".like-action")
  if (likeButton) {
    if (isLiked) {
      likeButton.classList.add("liked")
    } else {
      likeButton.classList.remove("liked")
    }
  }
}

// Add a comment to a post
function addComment(postId, commentText) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const posts = JSON.parse(localStorage.getItem("posts") || "[]")

  const postIndex = posts.findIndex((post) => post.id === postId)

  if (postIndex !== -1) {
    const newComment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      text: commentText,
      timestamp: new Date().toISOString(),
      likes: [],
    }

    posts[postIndex].comments.push(newComment)

    // Update posts in localStorage
    localStorage.setItem("posts", JSON.stringify(posts))

    // Update just the comments section without reloading all posts
    updatePostComments(postId, posts[postIndex].comments)
  }
}

// Update post comments without reloading all posts
function updatePostComments(postId, comments) {
  const commentsSection = document.getElementById(`comments-${postId}`)
  if (!commentsSection) return

  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // Get the comment form
  const commentForm = commentsSection.querySelector(".comment-form")

  // Clear comments section except for the form
  commentsSection.innerHTML = renderComments(comments, users)

  // Add the comment form back
  commentsSection.appendChild(commentForm)

  // Update comments count
  const postElement = document.querySelector(`.post[data-post-id="${postId}"]`)
  if (postElement) {
    const commentsCountElement = postElement.querySelector(".comments-count")
    if (commentsCountElement) {
      commentsCountElement.textContent = `${comments.length} comments`
    }
  }
}

// Load friend requests
function loadFriendRequests() {
  const friendRequestsContainer = document.getElementById("friendRequestsContainer")
  if (!friendRequestsContainer) return

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Find current user with updated data
  const updatedCurrentUser = users.find((user) => user.id === currentUser.id)

  if (!updatedCurrentUser || !updatedCurrentUser.friendRequests || updatedCurrentUser.friendRequests.length === 0) {
    friendRequestsContainer.innerHTML = "<p>No friend requests.</p>"
    return
  }

  // Clear container
  friendRequestsContainer.innerHTML = ""

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

      friendRequestsContainer.appendChild(requestElement)
    }
  })

  // Add event listeners for friend request actions
  addFriendRequestListeners()
}

// Add event listeners for friend request actions
function addFriendRequestListeners() {
  // Accept friend request
  const acceptButtons = document.querySelectorAll(".accept-btn")
  acceptButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const userId = this.getAttribute("data-user-id")
      acceptFriendRequest(userId)
    })
  })

  // Reject friend request
  const rejectButtons = document.querySelectorAll(".reject-btn")
  rejectButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const userId = this.getAttribute("data-user-id")
      rejectFriendRequest(userId)
    })
  })
}

// Load suggested friends
function loadSuggestedFriends() {
  const suggestedFriendsContainer = document.getElementById("suggestedFriendsContainer")
  if (!suggestedFriendsContainer) return

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Find current user with updated data
  const updatedCurrentUser = users.find((user) => user.id === currentUser.id)

  // Filter users who are not friends and have not sent/received friend requests
  const suggestedFriends = users.filter(
    (user) =>
      user.id !== currentUser.id &&
      !updatedCurrentUser.friends.includes(user.id) &&
      !updatedCurrentUser.friendRequests.includes(user.id) &&
      !updatedCurrentUser.sentRequests.includes(user.id),
  )

  if (suggestedFriends.length === 0) {
    suggestedFriendsContainer.innerHTML = "<p>No suggested friends.</p>"
    return
  }

  // Clear container
  suggestedFriendsContainer.innerHTML = ""

  // Display suggested friends (limit to 3)
  suggestedFriends.slice(0, 3).forEach((friend) => {
    const friendElement = document.createElement("div")
    friendElement.className = "suggested-friend-item"
    friendElement.innerHTML = `
      <img src="${friend.profilePic || "images/default-avatar.png"}" alt="${friend.fullName}" class="avatar-small">
      <div class="friend-info">
        <div class="friend-name">${friend.fullName}</div>
        <button class="friend-action-btn add-friend-btn" data-user-id="${friend.id}">Add Friend</button>
      </div>
    `

    suggestedFriendsContainer.appendChild(friendElement)
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

    // Reload suggested friends
    loadSuggestedFriends()

    alert("Friend request sent!")
  }
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
