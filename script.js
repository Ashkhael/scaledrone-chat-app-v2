const CHANNEL_ID = "wU0rP95TrerGgN3z";
let members = [];
let me;

function getRandomName() {
  const adjs = [
    "autumn",
    "hidden",
    "bitter",
    "misty",
    "silent",
    "empty",
    "dry",
    "dark",
    "summer",
    "icy",
    "delicate",
    "quiet",
    "white",
    "cool",
    "spring",
    "winter",
    "patient",
    "twilight",
    "dawn",
    "crimson",
    "wispy",
    "weathered",
    "blue",
    "billowing",
    "broken",
    "cold",
    "damp",
    "falling",
    "frosty",
    "green",
    "long",
    "late",
    "lingering",
    "bold",
    "little",
    "morning",
    "muddy",
    "old",
    "red",
    "rough",
    "still",
    "small",
    "sparkling",
    "throbbing",
    "shy",
    "wandering",
    "withered",
    "wild",
    "black",
    "young",
    "holy",
    "solitary",
    "fragrant",
    "aged",
    "snowy",
    "proud",
    "floral",
    "restless",
    "divine",
    "polished",
    "ancient",
    "purple",
    "lively",
    "nameless",
  ];
  const nouns = [
    "waterfall",
    "river",
    "breeze",
    "moon",
    "rain",
    "wind",
    "sea",
    "morning",
    "snow",
    "lake",
    "sunset",
    "pine",
    "shadow",
    "leaf",
    "dawn",
    "glitter",
    "forest",
    "hill",
    "cloud",
    "meadow",
    "sun",
    "glade",
    "bird",
    "brook",
    "butterfly",
    "bush",
    "dew",
    "dust",
    "field",
    "fire",
    "flower",
    "firefly",
    "feather",
    "grass",
    "haze",
    "mountain",
    "night",
    "pond",
    "darkness",
    "snowflake",
    "silence",
    "sound",
    "sky",
    "shape",
    "surf",
    "thunder",
    "violet",
    "water",
    "wildflower",
    "wave",
    "water",
    "resonance",
    "sun",
    "wood",
    "dream",
    "cherry",
    "tree",
    "fog",
    "frost",
    "voice",
    "paper",
    "frog",
    "smoke",
    "star",
  ];
  return (
    adjs[Math.floor(Math.random() * adjs.length)] +
    "_" +
    nouns[Math.floor(Math.random() * nouns.length)]
  );
}

function getName() {
  let input = prompt(
    "Please input a name between 3 and 12 characters long or leave empty for a random name:"
  );
  if (input === "") {
    input = getRandomName();
  } else if ((input.length > 0 && input.length < 3) || input.length > 12) {
    alert("Name not within specified parameters.");
    input = getName();
  } else {
    return input;
  }
  return input;
}

function getRandomColor() {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16);
}

$(function () {
  window.emojiPicker = new EmojiPicker({
    emojiable_selector: "[data-emojiable=true]",
    assetsPath: "./emoji/img/",
    popupButtonClasses: "fa fa-smile-o",
  });
  window.emojiPicker.discover();
});

const drone = new ScaleDrone(CHANNEL_ID, {
  data: {
    name: getName(),
    color: getRandomColor(),
  },
});

drone.on("open", (error) => {
  if (error) {
    return console.error(error);
  }
  console.log("Successfully connected to Scaledrone");

  const room = drone.subscribe("observable-room");
  room.on("open", (error) => {
    if (error) {
      return console.error(error);
    }
    console.log("Successfully joined room");
  });

  room.on("members", (m) => {
    members = m;
    me = members.find((m) => m.id === drone.clientId);
    updateMembers();
  });

  room.on("member_join", (member) => {
    members.push(member);
    updateMembers();
  });

  room.on("member_leave", ({ id }) => {
    const index = members.findIndex((member) => member.id === id);
    members.splice(index, 1);
    updateMembers();
  });

  room.on("data", (text, member) => {
    if (member) {
      addMessageToList(text, member);
    } else {
      console.log(text);
    }
  });
});

drone.on("close", (event) => {
  console.log("Connection was closed", event);
});

drone.on("error", (error) => {
  console.error(error);
});

const DOM = {
  me: document.querySelector(".me"),
  membersCount: document.querySelector(".members-count"),
  membersList: document.querySelector(".members-list"),
  messages: document.querySelector(".messages"),
  input: document.querySelector(".form-input"),
  form: document.querySelector(".message-form"),
};

/*
DOM.emojiInput.addEventListener("keyup", function (event) {
  if (event.code === "Enter") {
    sendMessage();
  }
});
*/
DOM.form.addEventListener("submit", sendMessage);
function sendMessage() {
  const value = DOM.input.value;
  if (value === "") {
    return;
  }
  DOM.input.value = "";
  drone.publish({
    room: "observable-room",
    message: value,
  });
}

$(".form-button").click(function () {
  $(".emoji-wysiwyg-editor").empty();
});

/*
$(".form-input").on("keypress", function (event) {
  if (event.which == 13) {
    $(".form-input").on("submit", sendMessage());
    $(".emoji-wysiwyg-editor").empty();
  }
});
*/

function createMemberElement(member) {
  const { name, color } = member.clientData;
  const el = document.createElement("div");
  el.appendChild(document.createTextNode(name));
  el.className = "member";
  el.style.color = color;
  return el;
}

function updateMembers() {
  DOM.me.innerHTML = "";
  DOM.me.appendChild(createMemberElement(me));
  DOM.membersList.innerHTML = "";
  members.forEach((member) =>
    DOM.membersList.appendChild(createMemberElement(member))
  );
  if (members.length > 1) {
    return (DOM.membersCount.innerText = `${members.length} users in room:`);
  } else {
    return (DOM.membersCount.innerText = `${members.length} user in room:`);
  }
}

function createMessageElement(text, member) {
  const el = document.createElement("div");
  el.appendChild(createMemberElement(member));
  el.appendChild(document.createTextNode(text));
  el.className = "message";
  return el;
}

function addMessageToList(text, member) {
  const el = DOM.messages;
  const wasTop = el.scrollTop === el.scrollHeight - el.clientHeight;
  el.appendChild(createMessageElement(text, member));
  if (wasTop) {
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }
}
