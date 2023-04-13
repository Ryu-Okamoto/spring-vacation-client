using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EraserBehaviorScript : MonoBehaviour
{
    [SerializeField] private GameObject particleObject;
    [SerializeField] private GameObject arrow;
    [SerializeField] private GameObject nameTag;

    void Update() {
        nameTag.transform.position = this.transform.position + new Vector3(0.0f, 0.0f, 3.0f);
        nameTag.transform.rotation = Quaternion.Euler(90.0f, 0.0f, 0.0f);
    }

    void SetNameTag(string name) {
        nameTag.GetComponent<TextMesh>().text = name;
    }

    void SetArrowActive(bool available) {
        arrow.SetActive(available);
    }

    void SetArrowScale(float scale) {
        scale *= 2.0f;
        arrow.transform.localScale = new Vector3(scale, scale, scale);
    }

    void SetArrowRotation(float angle) {
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