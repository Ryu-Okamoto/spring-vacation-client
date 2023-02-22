using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Main : MonoBehaviour
{
    [SerializeField] private Material[] coverColors;
    [SerializeField] private GameObject desk;
    [SerializeField] private GameObject dragHandler;
    [System.Serializable]
    class Users
    {
        public string[] users;
    }
    [System.Serializable]
    class PullInfo 
    {
        public string user;
        public float directionX;
        public float directionY;
    }

    private const int COVER_INDEX = 1;

    private Dictionary<string, GameObject> erasers;
    private bool isThereMoving;

    // for demo play
    private string playerName = "alice";

    void Start() {
        erasers = new Dictionary<string, GameObject>();
        isThereMoving = false;
        
        // for demo play
        Setup("{\"users\":[\"alice\", \"bob\", \"carol\", \"dave\", \"ellen\"]}");
        EnablePull();

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
    public void EnablePull() {
        dragHandler.SetActive(true);
        dragHandler.SendMessage("SetPlayerEraser", erasers[playerName]);
    }

    // Unity -> React
    void InformPullInfo(Vector2 direction) {
        dragHandler.SetActive(false);

        // TODO
        // call React's function and inform server with pull information.
        
        isThereMoving = true;
    }

    // React -> Unity
    public void ReflectPullInfo(string jsonString) {
        PullInfo pullInfo = JsonUtility.FromJson<PullInfo>(jsonString);
        string userName = pullInfo.user;
        if (playerName == userName)
            return;
        float directionX = pullInfo.directionX;
        float directionY = pullInfo.directionY;
        erasers[userName].SendMessage("AddForce", new Vector2(directionX, directionY));
        isThereMoving = true;
    }

    void Update() {
        if (isThereMoving) {
            foreach (var (username, eraser) in erasers) {
                if (eraser.transform.position.y < -5.0f) {
                    eraser.SendMessage("Explode");
                    erasers.Remove(username);
                    return;
                }
                if (!eraser.GetComponent<Rigidbody>().IsSleeping())
                    return;
            }
            isThereMoving = false;

            // for demo play
            if (erasers.ContainsKey(playerName))
                EnablePull();

            // TODO
            // call React's function and inform positions of erasers.
        }
    }
}
