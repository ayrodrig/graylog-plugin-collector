package org.graylog.plugins.collector.altConfigurations.rest.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.mongojack.Id;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;

@AutoValue
public abstract class CollectorConfiguration {
    @Id
    @ObjectId
    @Nullable
    @JsonProperty("id")
    public abstract String id();

    @JsonProperty("backend_id")
    public abstract String backendId();

    @JsonProperty("name")
    public abstract String name();

    @JsonProperty("template")
    public abstract String template();

    @JsonCreator
    public static CollectorConfiguration create(@Id @ObjectId @JsonProperty("id") @Nullable String id,
                                                @JsonProperty("backend_id") String backendId,
                                                @JsonProperty("name") String name,
                                                @JsonProperty("template") String template) {
        return new AutoValue_CollectorConfiguration(id, backendId, name, template);
    }
}
