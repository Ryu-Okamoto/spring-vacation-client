using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.UI;
using System.Runtime.InteropServices;

public class ResultMain : MonoBehaviour
{
    [SerializeField] private GameObject resultObjects;
    [SerializeField] private GameObject titleObjects;

    [SerializeField] private GameObject playerContent;
    [SerializeField] private GameObject nodePrefab;

    [System.Serializable]
    private class UserResult
    {
        public string user;
        public int    rank;
    }
    [System.Serializable]
    private class UserResults 
    {
        public UserResult[] result;
    }

    public void OnPushBackToTitleButton() {
        resultObjects.SetActive(false);
        titleObjects.SetActive(true);
    }

    List<GameObject> nodeList;
    
    void Start() {
        nodeList = new List<GameObject>();
    }

    // React -> Unity
    public void SetContent(string jsonString) {
        foreach (GameObject node in nodeList)
            Destroy(node);
        nodeList.Clear();
        UserResult[] userResults = JsonUtility.FromJson<UserResults>(jsonString).result;
        foreach (UserResult userResult in userResults) {
            GameObject node = Instantiate(nodePrefab, playerContent.transform.position, Quaternion.identity, playerContent.transform);
            nodeList.Add(node);
            node.SendMessage("SetName", userResult.rank + ". " + userResult.user);
        }
    }
}
