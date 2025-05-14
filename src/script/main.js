// Login/Register
document.addEventListener("DOMContentLoaded", function () {
  const authModal = document.getElementById("authModal");
  authModal.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    const tab = button.getAttribute("data-tab");
    const tabElement = document.querySelector(`#tab-${tab}`);
    const tabPane = document.querySelector(`#pills-${tab}`);

    if (tabElement && tabPane) {
      const tabTrigger = new bootstrap.Tab(tabElement);
      tabTrigger.show();
    }
  });
});
