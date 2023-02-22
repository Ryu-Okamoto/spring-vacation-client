using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BigExplosionScript : MonoBehaviour
{
    private ParticleSystem particle;

    void Start() {
        particle = gameObject.GetComponent<ParticleSystem>();
    }

    void Update() {
        if (particle.isStopped)
            Destroy(this.gameObject);
    }
}
