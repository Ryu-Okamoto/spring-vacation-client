using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;
using TMPro;

public class TitleMain : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void InformUsername(string username);

    [SerializeField] private GameObject     titleObjects;
    [SerializeField] private GameObject     waitingObjects;

    [SerializeField] private TMP_InputField inputField;
    [SerializeField] private TMP_Text       notice;

    [SerializeField] private GameObject     eraserPrefab;
    [SerializeField] private Material[]     coverColors;
    private const int                       COVER_INDEX = 1;
    private List<GameObject>                erasers;

    void Start()
    {
        inputField = inputField.GetComponent<TMP_InputField>();
        notice = notice.GetComponent<TMP_Text>();
        erasers = new List<GameObject>();
    }

    private float deltaTime = 0.0f;

    void Update()
    {
        if (!titleObjects.activeSelf)
            return;

        if (Input.GetKey(KeyCode.Return)) {
            foreach (GameObject eraser in erasers)
                eraser.SendMessage("Explode");
            erasers.Clear();
        }

        deltaTime += Time.deltaTime;
        if (deltaTime > 0.25f) {
            deltaTime = 0.0f;
            float x = UnityEngine.Random.Range(-40.0f, 40.0f);
            float z = UnityEngine.Random.Range(25.0f, 50.0f);
            GameObject eraser = Instantiate(eraserPrefab, new Vector3(x, 30.0f, z), Quaternion.identity);
            GameObject cover = eraser.transform.GetChild(COVER_INDEX).gameObject;
            eraser.transform.rotation = UnityEngine.Random.rotation;
            int colorIndex = UnityEngine.Random.Range(0, coverColors.Length);
            cover.GetComponent<MeshRenderer>().material = coverColors[colorIndex];
            erasers.Add(eraser);
        }

        foreach (GameObject eraser in erasers) {
            if (eraser.transform.position.y < -30.0f) {
                Destroy(eraser);
                erasers.Remove(eraser);
                break;
            }
        }
    }

    public void OnPushPlayButton() {
        string username = inputField.text;
        if (username == string.Empty)
            notice.text = "Enter name!";
        else
            InformUsername(username);
    }

    // React -> Unity
    public void postNotice(string content) {
        notice.text = content;
    }

    // React -> Unity
    public void ChangeToWaiting() {
        foreach (GameObject eraser in erasers)
            eraser.SendMessage("Explode");
        erasers.Clear();
        titleObjects.SetActive(false);
        waitingObjects.SetActive(true);
    }
}
