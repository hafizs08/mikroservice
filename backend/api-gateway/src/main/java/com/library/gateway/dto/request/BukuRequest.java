package com.library.gateway.dto.request;




import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class BukuRequest {
    private Integer idBuku;
    @NotNull
    private String judul;
    @NotNull
    private String penulis;
    private int tahunTerbit;
    private String isbn;
    private int jumlahBuku;
}

