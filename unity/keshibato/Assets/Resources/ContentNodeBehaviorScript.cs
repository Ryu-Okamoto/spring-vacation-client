using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class ContentNodeBehaviorScript : MonoBehaviour
{
    [SerializeField] private TMP_Text playerName;
    [SerializeField] private Image    signPanel;

    public void SetName(string name) {
        this.playerName.text = name;
    }
    public void TurnRed() {
        signPanel.color = new Color(1.0f, 0.0f, 0.0f, 1.0f);
    }
    public void TurnGreen() {
        signPanel.color = new Color(0.0f, 1.0f, 0.0f, 1.0f);
    }
}
