using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using System.Runtime.InteropServices;

public class Main : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void InformPullInfo(float directionX, float directionY, string rotation);
	private static extern void InformPosition(int isLast, string userName, float positionX, float positionY, float positionZ);
	
    [SerializeField] private Material[] coverColors;
    [SerializeField] private GameObject desk;
    [SerializeField] private GameObject dragHandler;
    
    [System.Serializable]
    class Users
    {
        public string[] users;
    }
    [System.Serializable]
    class PullInfo // TODO: Jsonの構造がちがう！
    {
        public string user;
        public float directionX;
        public float directionY;
    }
    [System.Serializable]
    class UserPosition 
    {
        public string user;
        public float positionX;
        public float positionY;
        public float positionZ;
    }
    [System.Serializable]
    class UserPositions
    {
        public UserPosition[] positions;
    }

    private const int COVER_INDEX = 1;

    private Dictionary<string, GameObject> erasers;
    private bool isMoving;

    void Start() {
        erasers = new Dictionary<string, GameObject>();
        isMoving = false;
    }

    // Raect -> Unity
    public void Setup(string jsonString) {
        foreach (var eraser in erasers.Values)
            eraser.SendMessage("Explode");
        erasers.Clear();
        string[] users = JsonUtility.FromJson<Users>(jsonString).users;
        GameObject prefab = (GameObject)Resources.Load("Eraser");
        Vector3[] initialPositions = CalculateInitialPositions(users.Length);
        for (int i = 0; i < users.Length; ++i) {
            GameObject eraser = Instantiate(prefab, initialPositions[i], Quaternion.identity);
            GameObject cover = eraser.transform.GetChild(COVER_INDEX).gameObject;
            int colorIndex = i % coverColors.Length;
            cover.GetComponent<MeshRenderer>().material = coverColors[colorIndex];
            erasers.Add(users[i], eraser);
        }
    }

    private Vector3[] CalculateInitialPositions(int numOfErasers) {
        float radius = 0.75f * desk.transform.localScale.z;
        float aspect = desk.transform.localScale.x / desk.transform.localScale.z;
        Vector3[] initialPositions = new Vector3[numOfErasers];
        for (int i = 0; i < numOfErasers; ++i) {
            float argument = Mathf.Deg2Rad * i * 360.0f / numOfErasers;
            initialPositions[i] = new Vector3(aspect * radius * Mathf.Cos(argument), 5.0f, radius * Mathf.Sin(argument));
        }
        return initialPositions;
    } 

    // React -> Unity
    public void EnablePull(string user) {
        dragHandler.SetActive(true);
        dragHandler.SendMessage("SetPlayerEraser", erasers[user]);
    }

    // React -> Unity
    public void ReflectPullInfo(string jsonString) {
        PullInfo pullInfo = JsonUtility.FromJson<PullInfo>(jsonString);
        string userName = pullInfo.user;
        float directionX = pullInfo.directionX;
        float directionY = pullInfo.directionY;
        erasers[userName].SendMessage("AddForce", new Vector2(directionX, directionY));
    }

    // React -> Unity
    public void SynchronizePositions(string jsonString) {
        UserPosition[] positions = JsonUtility.FromJson<UserPositions>(jsonString).positions;
        HashSet<string> deadUsers = new HashSet<string>(erasers.Keys);
        foreach (UserPosition position in positions) {
            deadUsers.Remove(position.user);
            if (erasers.ContainsKey(position.user)) 
                erasers[position.user].transform.position = new Vector3(position.positionX, position.positionY, position.positionZ);
            else {
                GameObject prefab = (GameObject)Resources.Load("Eraser");
                erasers.Add(position.user, Instantiate(prefab, new Vector3(position.positionX, position.positionY, position.positionZ), Quaternion.identity));
            }
        }
        foreach (string deadUser in deadUsers) {
            erasers[deadUser].SendMessage("Explode");
            erasers.Remove(deadUser);
        }
    }

    void Update() {
        if (isMoving) {
            foreach (var (username, eraser) in erasers) {
                if (eraser.transform.position.y < -5.0f) {
                    eraser.SendMessage("Explode");
                    erasers.Remove(username);
                    return;
                }
                if (!eraser.GetComponent<Rigidbody>().IsSleeping())
                    return;
            }
            isMoving = false;
            FireInformPosition();
        }
    }

    void FireInformPullInfo(Vector2 direction) {
        InformPullInfo(direction.x, direction.y, null);
    }
    void FireInformPosition() {
        foreach (string username in erasers.Keys) {
            Vector3 position = erasers[username].transform.position;
            if (username == erasers.Keys.Last())
                InformPosition(0, username, position.x, position.y, position.z);
            else
                InformPosition(1, username, position.x, position.y, position.z);
        }
    }
}
