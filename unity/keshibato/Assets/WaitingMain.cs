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
    
    private List<GameObject>            nodeList;

    [System.Serializable]
    private class UserInfo
    {
        public string user;
        public bool   isReady;    // ready => 1, not => 0
    }
    [System.Serializable]
    private class UserInfos
    {
        public UserInfo[] users;
    }

    public void OnPushReadyButton() {
        readyButton.SetActive(false);
        InformReady();
    }

    void Start() {
        nodeList = new List<GameObject>();
    }

    // React -> Unity
    public void SetContent(string jsonString) {
        foreach (GameObject node in nodeList)
            Destroy(node);
        nodeList.Clear();
        UserInfo[] userInfos = JsonUtility.FromJson<UserInfos>(jsonString).users;
        foreach (UserInfo userInfo in userInfos) {
            GameObject node = Instantiate(nodePrefab, playerContent.transform.position, Quaternion.identity, playerContent.transform);
            nodeList.Add(node);
            node.SendMessage("SetName", userInfo.user);
            if (userInfo.isReady)
                node.SendMessage("TurnGreen");
            else
                node.SendMessage("TurnRed");
        }
    }

    // React -> Unity
    public void ChangeToGame() {
        readyButton.SetActive(true);
        waitingObjects.SetActive(false);
        gameObjects.SetActive(true);
    }
}
