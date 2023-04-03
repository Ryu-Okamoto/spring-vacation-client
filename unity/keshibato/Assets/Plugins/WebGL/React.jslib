mergeInto(LibraryManager.library, {
  InformUsername: function (username) {
    window.dispatchReactUnityEvent("InformUsername", UTF8ToString(username));
  },
  InformReady: function () {
    window.dispatchReactUnityEvent("InformReady");
  },
  InformPullInfo: function (directionX, directionY) {
    window.dispatchReactUnityEvent("InformPullInfo", directionX, directionY);
  },
  InformPosition: function (isLast, userName, positionX, positionY, positionZ) {
    window.dispatchReactUnityEvent("InformPosition", isLast, UTF8ToString(userName), positionX, positionY, positionZ);
  },
});