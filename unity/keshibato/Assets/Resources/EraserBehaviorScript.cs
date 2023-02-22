using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EraserBehaviorScript : MonoBehaviour
{
    [SerializeField] private GameObject particleObject;
    private const int ARROW_INDEX = 3;

    void Start() {}
    void Update() {}

    void SetArrowActive(bool available) {
        transform.GetChild(ARROW_INDEX).gameObject.SetActive(available);
    }

    void SetArrowScale(float scale) {
        scale *= 2.0f;
        GameObject arrow = transform.GetChild(ARROW_INDEX).gameObject;
        arrow.transform.localScale = new Vector3(scale, scale, scale);
    }

    void SetArrowRotation(float angle) {
        GameObject arrow = transform.GetChild(ARROW_INDEX).gameObject;
        arrow.transform.rotation = Quaternion.Euler(90.0f, angle, 0.0f);
    }

    void AddForce(Vector2 direction) {
        Vector2 force = 1800.0f * direction;
        gameObject.GetComponent<Rigidbody>().AddForce(force.x, 0.0f, force.y);
    }

    void Explode() {
        Instantiate(particleObject, this.transform.position, Quaternion.identity);
        Destroy(this.gameObject);
    }
}