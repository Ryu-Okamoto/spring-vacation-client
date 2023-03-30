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

    void Start()
    {
        inputField = inputField.GetComponent<TMP_InputField>();
        notice = notice.GetComponent<TMP_Text>();
    }

    void Update()
    {
        // TODO: 消しゴムが落下する演出
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
        titleObjects.SetActive(false);
        waitingObjects.SetActive(true);
    }
}
