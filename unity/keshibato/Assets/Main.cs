using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Main : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        
    }

    Queue<GameObject> erasers = new Queue<GameObject>();
    bool instantiated = false;
    bool exploded = false;
    int instantiatedFrame = 0;
    int explodedFrame = 0;

    // Update is called once per frame
    void Update()
    {
        // 消しゴムの生成
        if (instantiated) {
            ++instantiatedFrame;
            if (instantiatedFrame == 60) {
                instantiatedFrame = 0;
                instantiated = false;
            }
        }
        else if (Input.GetKey(KeyCode.S)) {
            GameObject prefab = (GameObject)Resources.Load("Eraser");
            erasers.Enqueue(Instantiate(prefab, new Vector3(0.0f, 10.0f, 0.0f), Quaternion.identity));
            instantiated = true;
        }

        // 消しゴムの爆発
        if (exploded) {
            ++explodedFrame;
            if (explodedFrame == 30) {
                explodedFrame = 0;
                exploded = false;
            }
        }
        else if (Input.GetKey(KeyCode.Return)) {
            if (erasers.Count != 0) {
                GameObject eraser = erasers.Dequeue();
                eraser.SendMessage("explode");
                exploded = true;
            }
        }
    }
}
