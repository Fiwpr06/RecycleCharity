import data from "./data/donations.json";

document.addEventListener("DOMContentLoaded", async function () {
  const { targetAmount, donations: donationsData } = data;
  const donationTableContainer = document.getElementById(
    "donationTableContainer"
  );
  const totalDonatedElement = document.getElementById("totalDonated");
  const targetAmountElement = document.getElementById("targetAmount");
  const progressBarElement = document.getElementById("progressBar");
  const progressPercentageElement =
    document.getElementById("progressPercentage");
  const lastUpdatedDateElement = document.getElementById("lastUpdatedDate");

  function formatCurrency(amount) {
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }

  function formatDate(dateString) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  }

  const totalDonated = donationsData.reduce(
    (sum, donation) => sum + donation.amount,
    0
  );
  const percentage = Math.min((totalDonated / targetAmount) * 100, 100);

  if (totalDonatedElement) {
    totalDonatedElement.textContent = formatCurrency(totalDonated);
  }

  if (targetAmountElement) {
    targetAmountElement.textContent = formatCurrency(targetAmount);
  }

  // Set progress bar values directly without animation
  if (progressBarElement && progressPercentageElement) {
    progressPercentageElement.textContent = `${percentage.toFixed(0)}%`;
    progressBarElement.setAttribute("aria-valuenow", percentage.toFixed(0));
    progressBarElement.style.width = `${percentage}%`;
  }

  // Lấy ngày quyên góp gần nhất
  if (lastUpdatedDateElement) {
    if (donationsData.length > 0) {
      const latestDonationDate = donationsData
        .map((donation) => new Date(donation.date))
        .sort((a, b) => b - a)[0]; // Sắp xếp giảm dần và lấy ngày đầu tiên
      lastUpdatedDateElement.textContent = formatDate(
        latestDonationDate.toISOString().split("T")[0]
      );
    } else {
      lastUpdatedDateElement.textContent = "Chưa có dữ liệu";
    }
  }

  function renderDonationTable(donations) {
    if (!donationTableContainer) {
      console.log(
        "Donation table container not found on this page - this is normal for pages without donation table."
      );
      return;
    }

    const table = document.createElement("table");
    table.classList.add(
      "table",
      "table-striped",
      "table-hover",
      "table-bordered"
    );
    // Only add AOS attributes if AOS is available
    if (typeof AOS !== "undefined") {
      table.setAttribute("data-aos", "fade-up");
      table.setAttribute("data-aos-duration", "1000");
      table.setAttribute("data-aos-delay", "200");
    }

    const thead = document.createElement("thead");
    thead.classList.add("table-light");
    const headerRow = document.createElement("tr");
    const headers = [
      "STT",
      "Tên nhà hảo tâm",
      "Số tiền",
      "Ngày quyên góp",
      "Lời nhắn",
    ];

    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    if (donations.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = headers.length;
      td.textContent = "Chưa có thông tin quyên góp nào.";
      td.classList.add("text-center");
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      donations.forEach((donation, index) => {
        const tr = document.createElement("tr");

        const tdIndex = document.createElement("td");
        tdIndex.textContent = index + 1;
        tr.appendChild(tdIndex);

        const tdName = document.createElement("td");
        tdName.textContent = donation.name;
        tr.appendChild(tdName);

        const tdAmount = document.createElement("td");
        tdAmount.textContent = formatCurrency(donation.amount);
        tdAmount.classList.add("text-end", "fw-semibold");
        tr.appendChild(tdAmount);

        const tdDate = document.createElement("td");
        tdDate.textContent = formatDate(donation.date);
        tr.appendChild(tdDate);

        const tdMessage = document.createElement("td");
        tdMessage.textContent = donation.message || "-";
        tdMessage.classList.add("fst-italic", "text-muted");
        tr.appendChild(tdMessage);

        tbody.appendChild(tr);
      });
    }
    table.appendChild(tbody);

    donationTableContainer.innerHTML = "";
    donationTableContainer.appendChild(table);
  }
  donationsData.sort((a, b) => new Date(b.date) - new Date(a.date));

  renderDonationTable(data.donations);

  // Refresh AOS if available
  if (typeof AOS !== "undefined") {
    AOS.refresh();
  }
});
