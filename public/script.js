const API_URL = "/api/keywords";

async function fetchChannels() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const channels = await response.json();
    channelList.innerHTML = ""; // Clear existing list
    channels.forEach((channel) => {
      const li = document.createElement("li");
      li.innerHTML = `${channel.channel_id}&nbsp;&nbsp;&nbsp;&nbsp;`;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "DELETE";
      deleteButton.classList.add("remove-btn");
      deleteButton.onclick = () => deleteChannel(channel._id);

      li.appendChild(deleteButton);
      channelList.appendChild(li);
    });
  } catch (err) {
    console.error(`Error fetching channels: ${err.message}`);
  }
}
