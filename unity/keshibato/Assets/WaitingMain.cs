using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.UI;
using System.Runtime.InteropServices;

public class WaitingMain : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void InformReady();

    [SerializeField] private GameObject waitingObjects;
    [SerializeField] private GameObject gameObjects;

    [SerializeField] private GameObject readyButton;
    [SerializeField] private GameObject playerContent;
    [SerializeField] private GameObject nodePrefab;

    [System.Serializable]
    private class UserInfo
    {
        public string name;
        public int    ready;    // ready => 1, not => 0
    }
    [System.Serializable]
    private class UserInfos
    {
        public UserInfo[] infos;
    }

    public void OnPushReadyButton() {
        readyButton.SetActive(false);
        InformReady();
    }

    // React -> Unity
    public void SetContent(string jsonString) {
        UserInfo[] userInfos = JsonUtility.FromJson<UserInfos>(jsonString).infos;
        foreach (UserInfo userInfo in userInfos) {
            GameObject node = Instantiate(nodePrefab, playerContent.transform.position, Quaternion.identity, playerContent.transform);
            node.SendMessage("SetName", userInfo.name);
            if (userInfo.ready == 1)
                node.SendMessage("TurnGreen");
            else
                node.SendMessage("TurnRed");
        }
    }

    // React -> Unity
    public void ChangeToGame() {
        waitingObjects.SetActive(false);
        gameObjects.SetActive(true);
    }
}
