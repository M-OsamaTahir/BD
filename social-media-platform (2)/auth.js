// Update the updateUserInfo function to handle profile pictures
function updateUserInfo(user) {
  const userFullNameElements = document.querySelectorAll("#userFullName")
  if (userFullNameElements) {
    userFullNameElements.forEach((element) => {
      element.textContent = user.fullName
    })
  }

  // Update profile pictures if available
  if (user.profilePic) {
    const navProfilePic = document.getElementById("navProfilePic")
    const sidebarProfilePic = document.getElementById("sidebarProfilePic")

    if (navProfilePic) {
      navProfilePic.src = user.profilePic
    }

    if (sidebarProfilePic) {
      sidebarProfilePic.src = user.profilePic
    }
  }
}
