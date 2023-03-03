mergeInto(LibraryManager.library, {
  InformPullInfo: function (directionX, directionY) {
    window.dispatchReactUnityEvent("InformPullInfo", directionX, directionY);
  },
  InformPosition: function (isLast, userName, positionX, positionY, positionZ) {
    window.dispatchReactUnityEvent("InformPosition", isLast, UTF8ToString(userName), positionX, positionY, positionZ);
  },
});