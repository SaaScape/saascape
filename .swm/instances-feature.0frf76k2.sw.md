---
title: Instances Feature
---
<SwmSnippet path="/client/src/pages/Applications/ViewApplication/ViewInstance.tsx" line="17">

---

Here we will show a banner with just an overview of the instance

```tsx
      <StatisticBanner loading={false}>
        <div>
          <div className='title'>Replicas</div>
          <div className='value'>{1}</div>
        </div>
        <div>
          <div>
            <div className='title'>CPU Usage</div>
            <div className='value'>{`22%`}</div>
          </div>
        </div>
        <div>
          <div>
            <div className='title'>Memory</div>
            <div className='value'>{"424 Mb"}</div>
          </div>
        </div>
        <div>
          <div>
            <div className='title'>Version</div>
            <div className='value'>{instance?.version?.tag}</div>
          </div>
        </div>
      </StatisticBanner>
```

---

</SwmSnippet>

&nbsp;

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBc2Fhc2NhcGUlM0ElM0FrZWlyZGF2aWU=" repo-name="saascape"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
