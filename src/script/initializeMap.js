import L from "leaflet";
import "leaflet/dist/leaflet.css";
import locations from "./data/locations.json";

// Sửa lỗi icon marker và tùy chỉnh
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Tùy chỉnh icon marker
const greenIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const initializeMap = () => {
  const mapElement = document.getElementById("map-placeholder");
  if (!mapElement) {
    console.error(
      "Map placeholder element not found. Ensure #map-placeholder exists in the DOM."
    );
    return;
  }

  // Khởi tạo bản đồ Leaflet với tùy chọn (bật scrollWheelZoom)
  const map = L.map("map-placeholder", {
    center: [16.0544, 108.181], // Đà Nẵng
    zoom: 11,
    zoomControl: true,
    maxZoom: 18,
    minZoom: 1,
    // Bỏ scrollWheelZoom: false để bật zoom bằng lăn chuột
  });

  // Thêm tile layer mặc định của OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);


  // Thêm marker cho các điểm thu gom với icon xanh lá
  locations.forEach((location) => {
    L.marker([location.lat, location.lng], { icon: greenIcon })
      .addTo(map)
      .bindPopup(`<div class="map-popup">${location.title}</div>`, {
        className: "custom-popup",
      });
  });

  // Khởi tạo marker cho người dùng chọn
  let userMarker = null;

  // Tìm kiếm địa chỉ từ ô nhập
  const searchInput = document.getElementById("map-search-input");
  const searchButton = document.getElementById("button-search-map");
  const addressInput = document.getElementById("address");

  if (searchButton && searchInput) {
    searchButton.addEventListener("click", async () => {
      const address = searchInput.value;
      if (!address) {
        alert("Vui lòng nhập địa chỉ để tìm kiếm.");
        return;
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            address
          )}`
        );
        const data = await response.json();

        if (data.length > 0) {
          const { lat, lon } = data[0];
          map.flyTo([lat, lon], 15, { animate: true, duration: 1 }); // Hiệu ứng bay mượt mà

          // Xóa marker cũ nếu có
          if (userMarker) {
            userMarker.remove();
          }

          // Thêm marker mới với icon đỏ
          userMarker = L.marker([lat, lon], { icon: redIcon })
            .addTo(map)
            .bindPopup(`<div class="map-popup">Địa chỉ của bạn</div>`, {
              className: "custom-popup",
            })
            .openPopup();

          // Điền địa chỉ vào ô "Địa chỉ thu gom"
          if (addressInput) {
            addressInput.value = data[0].display_name;
          }
        } else {
          alert("Không tìm thấy địa chỉ.");
        }
      } catch (error) {
        console.error("Error during geocoding:", error);
        alert("Không thể tìm kiếm địa chỉ. Vui lòng thử lại.");
      }
    });
  }

  // Thêm sự kiện nhấp chuột vào bản đồ
  map.on("click", async (e) => {
    const { lat, lng } = e.latlng;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      if (data && data.display_name) {
        // Xóa marker cũ nếu có
        if (userMarker) {
          userMarker.remove();
        }

        // Thêm marker mới với icon đỏ
        userMarker = L.marker([lat, lng], { icon: redIcon })
          .addTo(map)
          .bindPopup(`<div class="map-popup">Địa chỉ của bạn</div>`, {
            className: "custom-popup",
          })
          .openPopup();

        // Điền địa chỉ vào ô "Địa chỉ thu gom" và "Tìm kiếm"
        if (addressInput) {
          addressInput.value = data.display_name;
        }
        if (searchInput) {
          searchInput.value = data.display_name;
        }

        // Căn giữa bản đồ tại vị trí nhấp với hiệu ứng
        map.flyTo([lat, lng], 15, { animate: true, duration: 1 });
      } else {
        alert("Không tìm thấy địa chỉ cho vị trí này.");
      }
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
      alert("Không thể lấy địa chỉ. Vui lòng thử lại.");
    }
  });
};

export default initializeMap;
