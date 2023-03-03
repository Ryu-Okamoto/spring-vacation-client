using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;

public class DragHandlerScript : MonoBehaviour, IDragHandler, IBeginDragHandler, IEndDragHandler
{
    [SerializeField] private GameObject gameManager;

    private float previousScreenWidth;
    private float previousScreenHeight;
    private float dragPlay;
    private float dragMax;
    private GameObject playerEraser;
    private Vector2 beginPoint;

    void Start() {}

    void Update() {
        if (previousScreenWidth != Screen.width || previousScreenHeight != Screen.height) {
            previousScreenHeight = Screen.height;
            dragMax = Mathf.Min(Screen.width, Screen.height);
            dragPlay = 0.1f * dragMax;
            dragMax -= dragPlay;
        }
    }

    void SetPlayerEraser(GameObject eraser) {
        playerEraser = eraser;
    }

    public void OnDrag(PointerEventData eventData) {
        Vector2 difference = beginPoint - eventData.position;
        if (difference.magnitude > dragPlay) {
            float scale = Mathf.Min(difference.magnitude / dragMax, 1.0f);
            float angle = Mathf.Atan(difference.x / difference.y) / Mathf.Deg2Rad;
            if (difference.y < 0)
                angle += 180.0f;
            playerEraser.SendMessage("SetArrowActive", true);
            playerEraser.SendMessage("SetArrowScale", scale);
            playerEraser.SendMessage("SetArrowRotation", angle);
        }
        else {
            playerEraser.SendMessage("SetArrowActive", false);
        }
    }

    public void OnBeginDrag(PointerEventData eventData) {
        beginPoint = eventData.position;
    }

    public void OnEndDrag(PointerEventData eventData) {
        Vector2 difference = beginPoint - eventData.position;
        if (difference.magnitude > dragPlay) {
            float scale = Mathf.Min(difference.magnitude / dragMax, 1.0f);
            Vector2 direction = scale * difference.normalized; 
            playerEraser.SendMessage("AddForce", direction);
            gameManager.SendMessage("FireInformPullInfo", direction);
            gameObject.SetActive(false); // NEW
        }
        playerEraser.SendMessage("SetArrowActive", false);
    }
}