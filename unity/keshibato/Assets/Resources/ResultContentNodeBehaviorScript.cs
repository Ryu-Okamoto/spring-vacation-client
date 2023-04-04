using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class ResultContentNodeBehaviorScript : MonoBehaviour
{
    [SerializeField] private TMP_Text playerName;

    public void SetName(string name) {
        playerName.text = name;
    }
}
