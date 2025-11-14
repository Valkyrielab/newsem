
ocument.addEventListener("DOMContentLoaded", () => {
      const userRole = localStorage.getItem("userRole"); // 'admin' or 'employee'

      if (userRole !== "admin") {
        document.body.classList.add("read-only");

        // Hide admin-only nav links
        document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");

        // Hide modal completely
        const warningModal = document.getElementById("warningModal");
        if (warningModal) warningModal.style.display = "none";

        // Disable form fields if modal is somehow opened
        const warningForm = document.getElementById("warningForm");
        if (warningForm) {
          warningForm.querySelectorAll("input, textarea, select, button").forEach(el => {
            el.disabled = true;
          });
        }

      }
    });
