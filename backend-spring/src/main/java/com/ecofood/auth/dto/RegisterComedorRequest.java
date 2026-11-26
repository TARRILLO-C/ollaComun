package com.ecofood.auth.dto;

public class RegisterComedorRequest {

    private String docType;
    private String docNumber;
    private String businessName;
    private String representativeName;
    private String phone;
    private String address;
    private Integer racionesDiarias;
    private Double latitude;
    private Double longitude;

    public RegisterComedorRequest() {}

    public RegisterComedorRequest(String docType, String docNumber, String businessName, String representativeName, String phone, String address) {
        this.docType = docType;
        this.docNumber = docNumber;
        this.businessName = businessName;
        this.representativeName = representativeName;
        this.phone = phone;
        this.address = address;
    }

    public String getDocType() { return docType; }
    public void setDocType(String docType) { this.docType = docType; }

    public String getDocNumber() { return docNumber; }
    public void setDocNumber(String docNumber) { this.docNumber = docNumber; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getRepresentativeName() { return representativeName; }
    public void setRepresentativeName(String representativeName) { this.representativeName = representativeName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Integer getRacionesDiarias() { return racionesDiarias; }
    public void setRacionesDiarias(Integer racionesDiarias) { this.racionesDiarias = racionesDiarias; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
