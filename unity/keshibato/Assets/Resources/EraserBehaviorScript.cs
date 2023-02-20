using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EraserBehaviorScript : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public GameObject particleObject;
    void explode() {
        Instantiate(particleObject, this.transform.position, Quaternion.identity);
        Destroy(this.gameObject);
    }
}
